import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCheck,
  FaEye,
  FaImage,
  FaRedo,
  FaSave,
  FaTimes,
  FaVideo,
} from "react-icons/fa";

import AdminLayout from "../AdminLayout/AdminLayout";

import "./AdminHero.css";

const API_URL = "http://127.0.0.1:8000";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 10 * 1024 * 1024;

const MIN_VIDEO_DURATION = 10;
const MAX_VIDEO_DURATION = 30;

/* ============================================================
   STORED USER ROLE
============================================================ */

const getStoredUserRole = () => {
  return String(
    localStorage.getItem("tfortech_user_role") || "customer"
  )
    .toLowerCase()
    .trim();
};


/* ============================================================
   DEFAULT HERO
============================================================ */

const DEFAULT_HERO = {
  enabled: true,

  badge: "PREMIUM LAPTOPS & ACCESSORIES",

  title: "Technology That Fits Your World",

  description:
    "Discover reliable laptops, gaming machines and essential accessories for work, study, gaming and everyday life.",

  primary_button_text: "View Products",
  primary_button_link: "/products",

  secondary_button_text: "Explore Categories",
  secondary_button_link: "/categories",

  image: "",

  video_enabled: false,
  video: "",

  overlay_opacity: 0.78,

  image_position: "center",
};


/* ============================================================
   NORMALIZE HERO
============================================================ */

const normalizeHero = (serverHero) => {
  if (!serverHero) {
    return {
      ...DEFAULT_HERO,
    };
  }

  return {
    ...DEFAULT_HERO,
    ...serverHero,
  };
};


/* ============================================================
   GET VIDEO DURATION
============================================================ */

const getVideoDuration = (videoUrl) => {
  return new Promise((resolve, reject) => {
    if (!videoUrl) {
      reject(
        new Error(
          "No Hero video was provided."
        )
      );

      return;
    }

    const video = document.createElement("video");

    let finished = false;

    const cleanup = () => {
      video.removeAttribute("src");
      video.load();
    };

    const complete = (callback) => {
      if (finished) {
        return;
      }

      finished = true;
      callback();
      cleanup();
    };

    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = () => {
      const duration = Number(video.duration);

      if (
        !Number.isFinite(duration) ||
        duration <= 0
      ) {
        complete(() =>
          reject(
            new Error(
              "Unable to determine the Hero video duration."
            )
          )
        );

        return;
      }

      complete(() =>
        resolve(duration)
      );
    };

    video.onerror = () => {
      complete(() =>
        reject(
          new Error(
            "Unable to load the Hero video. Please check the video URL."
          )
        )
      );
    };

    video.src = videoUrl;
    video.load();
  });
};


/* ============================================================
   ADMIN HERO
============================================================ */

const AdminHero = () => {
  const navigate = useNavigate();

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const temporaryVideoUrlRef = useRef(null);

  const previewVideoRef = useRef(null);

  const [hero, setHero] = useState({
    ...DEFAULT_HERO,
  });

  const [originalHero, setOriginalHero] = useState({
    ...DEFAULT_HERO,
  });

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [resetting, setResetting] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [showPreview, setShowPreview] = useState(false);

  /*
    Preview media starts with video when video is enabled.
    After video finishes, we switch to image.
  */
  const [previewMedia, setPreviewMedia] =
    useState("image");

  const [imageSource, setImageSource] =
    useState("url");

  const [videoSource, setVideoSource] =
    useState("url");

  const [selectedImageName, setSelectedImageName] =
    useState("");

  const [selectedVideoName, setSelectedVideoName] =
    useState("");

  const [videoDuration, setVideoDuration] =
    useState(null);

  const [
    videoValidationLoading,
    setVideoValidationLoading,
  ] = useState(false);


  /* ==========================================================
     CLEANUP TEMP VIDEO URL
  ========================================================== */

  useEffect(() => {
    return () => {
      if (temporaryVideoUrlRef.current) {
        URL.revokeObjectURL(
          temporaryVideoUrlRef.current
        );

        temporaryVideoUrlRef.current = null;
      }
    };
  }, []);


  /* ==========================================================
     AUTH
  ========================================================== */

  const getToken = () => {
    return localStorage.getItem(
      "tfortech_access_token"
    );
  };


  const handleAuthenticationFailure =
    useCallback(() => {
      const authKeys = [
        "tfortech_logged_in",
        "tfortech_access_token",
        "tfortech_token_type",
        "tfortech_user_id",
        "tfortech_user_name",
        "tfortech_user_email",
        "tfortech_user_phone",
        "tfortech_user_role",
        "tfortech_remember_me",
      ];

      authKeys.forEach((key) => {
        localStorage.removeItem(key);
      });

      navigate("/login");
    }, [navigate]);


  /* ==========================================================
     LOAD HERO
  ========================================================== */

  const fetchHero = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      if (getStoredUserRole() !== "admin") {
        navigate("/");
        return;
      }

      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/hero/settings`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.status === 401) {
        handleAuthenticationFailure();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Unable to load Hero settings."
        );
      }

      const loadedHero = normalizeHero(
        data?.hero
      );

      setHero(loadedHero);
      setOriginalHero(loadedHero);

      if (
        loadedHero.image &&
        loadedHero.image.startsWith("data:")
      ) {
        setImageSource("gallery");
      } else {
        setImageSource("url");
      }

      if (
        loadedHero.video &&
        loadedHero.video.startsWith("data:")
      ) {
        setVideoSource("gallery");
      } else {
        setVideoSource("url");
      }

      setSelectedImageName("");
      setSelectedVideoName("");
      setVideoDuration(null);

      /*
        Initial preview state.
        When video exists and is enabled, preview starts
        with the video. Otherwise it starts with image.
      */
      if (
        loadedHero.video_enabled &&
        loadedHero.video
      ) {
        setPreviewMedia("video");
      } else {
        setPreviewMedia("image");
      }
    } catch (fetchError) {
      console.error(
        "Hero loading error:",
        fetchError
      );

      setError(
        fetchError.message ||
          "Unable to load Hero settings."
      );
    } finally {
      setLoading(false);
    }
  }, [
    navigate,
    handleAuthenticationFailure,
  ]);


  useEffect(() => {
    fetchHero();
  }, [fetchHero]);


  /* ==========================================================
     FIELD UPDATE
  ========================================================== */

  const updateHero = (field, value) => {
    setHero((previousHero) => ({
      ...previousHero,
      [field]: value,
    }));

    setError("");
    setSuccess("");
  };


  /* ==========================================================
     IMAGE SOURCE
  ========================================================== */

  const handleImageSourceChange = (source) => {
    setImageSource(source);

    setError("");
    setSuccess("");

    if (source === "url") {
      setSelectedImageName("");

      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    }
  };


  /* ==========================================================
     VIDEO SOURCE
  ========================================================== */

  const handleVideoSourceChange = (source) => {
    setVideoSource(source);

    setError("");
    setSuccess("");

    if (source === "url") {
      setSelectedVideoName("");
      setVideoDuration(null);

      if (videoInputRef.current) {
        videoInputRef.current.value = "";
      }
    }
  };


  /* ==========================================================
     IMAGE GALLERY
  ========================================================== */

  const handleGalleryImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setSuccess("");

    if (!file.type.startsWith("image/")) {
      setError(
        "Please select a valid image file."
      );

      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError(
        "Image size must be 5 MB or smaller."
      );

      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (
        typeof reader.result !==
        "string"
      ) {
        setError(
          "Unable to process the selected image."
        );

        return;
      }

      setHero((previousHero) => ({
        ...previousHero,
        image: reader.result,
      }));

      setSelectedImageName(
        file.name
      );

      setImageSource("gallery");
    };

    reader.onerror = () => {
      setError(
        "Unable to read the selected image. Please try again."
      );
    };

    reader.readAsDataURL(file);
  };


  /* ==========================================================
     VIDEO GALLERY
  ========================================================== */

  const handleGalleryVideoChange = async (
    event
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setSuccess("");
    setVideoDuration(null);

    if (!file.type.startsWith("video/")) {
      setError(
        "Please select a valid video file."
      );

      event.target.value = "";
      return;
    }

    if (file.size > MAX_VIDEO_SIZE) {
      setError(
        "Video size must be 8 MB or smaller."
      );

      event.target.value = "";
      return;
    }

    setVideoValidationLoading(true);

    try {
      if (
        temporaryVideoUrlRef.current
      ) {
        URL.revokeObjectURL(
          temporaryVideoUrlRef.current
        );

        temporaryVideoUrlRef.current =
          null;
      }

      const temporaryUrl =
        URL.createObjectURL(file);

      temporaryVideoUrlRef.current =
        temporaryUrl;

      const duration =
        await getVideoDuration(
          temporaryUrl
        );

      if (
        duration <
          MIN_VIDEO_DURATION ||
        duration >
          MAX_VIDEO_DURATION
      ) {
        URL.revokeObjectURL(
          temporaryUrl
        );

        temporaryVideoUrlRef.current =
          null;

        setError(
          `Hero video must be between ${MIN_VIDEO_DURATION} and ${MAX_VIDEO_DURATION} seconds. Selected video is ${duration.toFixed(
            1
          )} seconds.`
        );

        event.target.value = "";
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        if (
          typeof reader.result !==
          "string"
        ) {
          setError(
            "Unable to process the selected video."
          );

          return;
        }

        setHero((previousHero) => ({
          ...previousHero,

          video: reader.result,

          /*
            Selecting a valid video automatically enables it.
          */
          video_enabled: true,
        }));

        setSelectedVideoName(
          file.name
        );

        setVideoDuration(duration);

        setVideoSource("gallery");

        setPreviewMedia("video");
      };

      reader.onerror = () => {
        setError(
          "Unable to read the selected video. Please try again."
        );
      };

      reader.readAsDataURL(file);
    } catch (videoError) {
      console.error(
        "Hero video validation error:",
        videoError
      );

      setError(
        videoError.message ||
          "Unable to validate the selected Hero video."
      );

      event.target.value = "";
    } finally {
      setVideoValidationLoading(false);
    }
  };


  /* ==========================================================
     CLEAR IMAGE
  ========================================================== */

  const handleClearImage = () => {
    setHero((previousHero) => ({
      ...previousHero,
      image: "",
    }));

    setSelectedImageName("");

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }

    setError("");
    setSuccess("");
  };


  /* ==========================================================
     CLEAR VIDEO
  ========================================================== */

  const handleClearVideo = () => {
    setHero((previousHero) => ({
      ...previousHero,

      video: "",

      video_enabled: false,
    }));

    setSelectedVideoName("");
    setVideoDuration(null);

    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }

    if (
      temporaryVideoUrlRef.current
    ) {
      URL.revokeObjectURL(
        temporaryVideoUrlRef.current
      );

      temporaryVideoUrlRef.current =
        null;
    }

    setPreviewMedia("image");

    setError("");
    setSuccess("");
  };


  /* ==========================================================
     OPEN PREVIEW
  ========================================================== */

  const handleOpenPreview = () => {
    if (
      hero.video_enabled &&
      hero.video
    ) {
      setPreviewMedia("video");
    } else {
      setPreviewMedia("image");
    }

    setShowPreview(true);
  };


  /* ==========================================================
     VIDEO ENDED
  ========================================================== */

  const handlePreviewVideoEnded = () => {
    /*
      IMPORTANT:
      Video plays only once.

      When the video ends, the exact same Hero
      immediately switches to the selected image.
    */

    setPreviewMedia("image");
  };


  /* ==========================================================
     VIDEO ERROR FALLBACK
  ========================================================== */

  const handlePreviewVideoError = () => {
    /*
      If video cannot load, do not break Hero preview.
      Fall back to the image.
    */

    setPreviewMedia("image");

    setError(
      "Hero video could not be played. Image fallback is being shown."
    );
  };


  /* ==========================================================
     DISCARD
  ========================================================== */

  const handleDiscard = () => {
    setHero({
      ...originalHero,
    });

    setError("");
    setSuccess("");

    if (
      originalHero.image
    ) {
      if (
        originalHero.image.startsWith(
          "data:"
        )
      ) {
        setImageSource("gallery");
      } else {
        setImageSource("url");
      }
    } else {
      setImageSource("url");
    }

    if (
      originalHero.video
    ) {
      if (
        originalHero.video.startsWith(
          "data:"
        )
      ) {
        setVideoSource("gallery");
      } else {
        setVideoSource("url");
      }
    } else {
      setVideoSource("url");
    }

    if (
      originalHero.video_enabled &&
      originalHero.video
    ) {
      setPreviewMedia("video");
    } else {
      setPreviewMedia("image");
    }

    setSelectedImageName("");
    setSelectedVideoName("");
    setVideoDuration(null);

    if (imageInputRef.current) {
      imageInputRef.current.value =
        "";
    }

    if (videoInputRef.current) {
      videoInputRef.current.value =
        "";
    }
  };


  /* ==========================================================
     RESET
  ========================================================== */

  const handleReset = async () => {
    if (getStoredUserRole() !== "admin") {
      navigate("/");
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to reset the Hero to the default settings?"
      );

    if (!confirmed) {
      return;
    }

    setResetting(true);
    setError("");
    setSuccess("");

    try {
      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/hero/settings/reset`,
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${token}`,
            Accept:
              "application/json",
          },
        }
      );

      if (response.status === 401) {
        handleAuthenticationFailure();
        return;
      }

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Unable to reset Hero settings."
        );
      }

      const resetHero =
        normalizeHero(
          data?.hero
        );

      setHero(resetHero);
      setOriginalHero(resetHero);

      setImageSource("url");
      setVideoSource("url");

      setSelectedImageName("");
      setSelectedVideoName("");
      setVideoDuration(null);

      setPreviewMedia("image");

      if (imageInputRef.current) {
        imageInputRef.current.value =
          "";
      }

      if (videoInputRef.current) {
        videoInputRef.current.value =
          "";
      }

      setSuccess(
        "Hero has been reset to default successfully."
      );
    } catch (resetError) {
      console.error(
        "Hero reset error:",
        resetError
      );

      setError(
        resetError.message ||
          "Unable to reset Hero settings."
      );
    } finally {
      setResetting(false);
    }
  };


  /* ==========================================================
     SAVE
  ========================================================== */

  const handleSave = async () => {
    if (getStoredUserRole() !== "admin") {
      navigate("/");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const heroData = {
        enabled: Boolean(
          hero.enabled
        ),

        badge: String(
          hero.badge || ""
        ).trim(),

        title: String(
          hero.title || ""
        ).trim(),

        description: String(
          hero.description || ""
        ).trim(),

        primary_button_text:
          String(
            hero.primary_button_text ||
              ""
          ).trim(),

        primary_button_link:
          String(
            hero.primary_button_link ||
              ""
          ).trim(),

        secondary_button_text:
          String(
            hero.secondary_button_text ||
              ""
          ).trim(),

        secondary_button_link:
          String(
            hero.secondary_button_link ||
              ""
          ).trim(),

        image: String(
          hero.image || ""
        ).trim(),

        video_enabled: Boolean(
          hero.video_enabled
        ),

        video: String(
          hero.video || ""
        ).trim(),

        overlay_opacity:
          Number(
            hero.overlay_opacity
          ),

        image_position:
          hero.image_position ||
          "center",
      };


      /* ------------------------------------------------------
         TEXT VALIDATION
      ------------------------------------------------------ */

      if (!heroData.title) {
        throw new Error(
          "Hero title is required."
        );
      }

      if (!heroData.description) {
        throw new Error(
          "Hero description is required."
        );
      }

      if (
        !heroData.primary_button_text
      ) {
        throw new Error(
          "Primary button text is required."
        );
      }

      if (
        !heroData.primary_button_link
      ) {
        throw new Error(
          "Primary button link is required."
        );
      }

      if (
        !heroData.secondary_button_text
      ) {
        throw new Error(
          "Secondary button text is required."
        );
      }

      if (
        !heroData.secondary_button_link
      ) {
        throw new Error(
          "Secondary button link is required."
        );
      }


      /* ------------------------------------------------------
         OVERLAY VALIDATION
      ------------------------------------------------------ */

      if (
        Number.isNaN(
          heroData.overlay_opacity
        ) ||
        heroData.overlay_opacity <
          0 ||
        heroData.overlay_opacity >
          1
      ) {
        throw new Error(
          "Overlay opacity must be between 0 and 1."
        );
      }


      /* ------------------------------------------------------
         VIDEO VALIDATION
      ------------------------------------------------------ */

      if (
        heroData.video_enabled &&
        !heroData.video
      ) {
        throw new Error(
          "Please add a Hero video before enabling background video."
        );
      }

      /*
        For gallery videos, the duration has already been
        checked when selected.
      */

      if (
        videoSource === "gallery" &&
        heroData.video &&
        videoDuration !== null
      ) {
        if (
          videoDuration <
            MIN_VIDEO_DURATION ||
          videoDuration >
            MAX_VIDEO_DURATION
        ) {
          throw new Error(
            `Hero video must be between ${MIN_VIDEO_DURATION} and ${MAX_VIDEO_DURATION} seconds.`
          );
        }
      }


      /*
        For a video URL, inspect the video's metadata before
        saving so the same 10–30 second rule applies.
      */

      if (
        videoSource === "url" &&
        heroData.video_enabled &&
        heroData.video
      ) {
        setVideoValidationLoading(true);

        try {
          const duration =
            await getVideoDuration(
              heroData.video
            );

          if (
            duration <
              MIN_VIDEO_DURATION ||
            duration >
              MAX_VIDEO_DURATION
          ) {
            throw new Error(
              `Hero video must be between ${MIN_VIDEO_DURATION} and ${MAX_VIDEO_DURATION} seconds. Selected video is ${duration.toFixed(
                1
              )} seconds.`
            );
          }

          setVideoDuration(
            duration
          );
        } finally {
          setVideoValidationLoading(
            false
          );
        }
      }


      /* ------------------------------------------------------
         SAVE TO BACKEND
      ------------------------------------------------------ */

      const response = await fetch(
        `${API_URL}/api/hero/settings`,
        {
          method: "PUT",
          headers: {
            Authorization:
              `Bearer ${token}`,
            Accept:
              "application/json",
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            heroData
          ),
        }
      );

      if (response.status === 401) {
        handleAuthenticationFailure();
        return;
      }

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Unable to save Hero settings."
        );
      }

      const savedHero =
        normalizeHero(
          data?.hero ||
            heroData
        );

      setHero(savedHero);
      setOriginalHero(savedHero);

      if (
        savedHero.image &&
        savedHero.image.startsWith(
          "data:"
        )
      ) {
        setImageSource(
          "gallery"
        );
      } else {
        setImageSource(
          "url"
        );
      }

      if (
        savedHero.video &&
        savedHero.video.startsWith(
          "data:"
        )
      ) {
        setVideoSource(
          "gallery"
        );
      } else {
        setVideoSource(
          "url"
        );
      }

      setSelectedImageName("");
      setSelectedVideoName("");

      /*
        After saving, the next preview starts with video
        when video is enabled, otherwise image.
      */

      if (
        savedHero.video_enabled &&
        savedHero.video
      ) {
        setPreviewMedia("video");
      } else {
        setPreviewMedia("image");
      }

      setSuccess(
        "Hero settings saved successfully."
      );
    } catch (saveError) {
      console.error(
        "Hero save error:",
        saveError
      );

      setError(
        saveError.message ||
          "Unable to save Hero settings."
      );
    } finally {
      setSaving(false);
      setVideoValidationLoading(false);
    }
  };


  /* ==========================================================
     CLOSE PREVIEW
  ========================================================== */

  const handleClosePreview = () => {
    if (
      previewVideoRef.current
    ) {
      previewVideoRef.current.pause();
    }

    setShowPreview(false);
  };


  /* ==========================================================
     PREVIEW STYLE
  ========================================================== */

  const previewStyle = {
    "--hero-preview-image":
      hero.image
        ? `url("${hero.image}")`
        : "none",

    "--hero-preview-position":
      hero.image_position ||
      "center",

    "--hero-preview-overlay":
      Number.isFinite(
        Number(
          hero.overlay_opacity
        )
      )
        ? Number(
            hero.overlay_opacity
          )
        : 0.78,
  };


  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-hero-page">

          <div className="admin-hero-loading">

            <div className="admin-hero-spinner"></div>

            <p>
              Loading Hero settings...
            </p>

          </div>

        </div>
      </AdminLayout>
    );
  }


  /* ==========================================================
     PAGE
  ========================================================== */

  return (
    <AdminLayout>

      <div className="admin-hero-page">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="admin-hero-header">

          <div className="admin-hero-heading">

            <button
              type="button"
              className="admin-hero-back-button"
              onClick={() =>
                navigate("/admin")
              }
              aria-label="Back to dashboard"
            >
              <FaArrowLeft />
            </button>

            <div className="admin-hero-title-row">

              <div className="admin-hero-title-icon">
                <FaImage />
              </div>

              <div>

                <h1>
                  Hero
                </h1>

                <p>
                  Manage the homepage Hero
                  content, image and
                  video sequence.
                </p>

              </div>

            </div>

          </div>

          <div className="admin-hero-header-actions">

            <button
              type="button"
              className="admin-hero-preview-button"
              onClick={
                handleOpenPreview
              }
              disabled={
                saving ||
                resetting
              }
            >
              <FaEye />
              Preview
            </button>

            <button
              type="button"
              className="admin-hero-reset-button"
              onClick={handleReset}
              disabled={
                resetting ||
                saving
              }
            >
              <FaRedo
                className={
                  resetting
                    ? "admin-hero-spin"
                    : ""
                }
              />

              {resetting
                ? "Resetting..."
                : "Reset"}
            </button>

            <button
              type="button"
              className="admin-hero-save-button"
              onClick={handleSave}
              disabled={
                saving ||
                resetting ||
                videoValidationLoading
              }
            >
              <FaSave />

              {saving ||
              videoValidationLoading
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>

        </div>


        {/* ==================================================
            ALERTS
        ================================================== */}

        {error && (
          <div className="admin-hero-alert admin-hero-alert-error">

            <FaTimes />

            <span>
              {error}
            </span>

          </div>
        )}

        {success && (
          <div className="admin-hero-alert admin-hero-alert-success">

            <FaCheck />

            <span>
              {success}
            </span>

          </div>
        )}


        {/* ==================================================
            CONTENT
        ================================================== */}

        <div className="admin-hero-content">

          {/* =================================================
              HERO STATUS
          ================================================= */}

          <section className="admin-hero-card">

            <div className="admin-hero-card-header">

              <div className="admin-hero-card-icon">
                <FaEye />
              </div>

              <div>

                <h2>
                  Hero Status
                </h2>

                <p>
                  Control whether the Hero
                  section is visible on the
                  homepage.
                </p>

              </div>

            </div>

            <div className="admin-hero-toggle-content">

              <div>

                <strong>
                  Show Hero Section
                </strong>

                <span>
                  Turn this off to hide the
                  entire Hero section.
                </span>

              </div>

              <label className="admin-hero-switch">

                <input
                  type="checkbox"
                  checked={Boolean(
                    hero.enabled
                  )}
                  onChange={(event) =>
                    updateHero(
                      "enabled",
                      event.target.checked
                    )
                  }
                  disabled={
                    saving ||
                    resetting
                  }
                />

                <span className="admin-hero-switch-slider"></span>

              </label>

            </div>

          </section>


          {/* =================================================
              HERO CONTENT
          ================================================= */}

          <section className="admin-hero-card">

            <div className="admin-hero-card-header">

              <div className="admin-hero-card-icon">
                <FaImage />
              </div>

              <div>

                <h2>
                  Hero Content
                </h2>

                <p>
                  Edit the text displayed
                  over the Hero media.
                </p>

              </div>

            </div>

            <div className="admin-hero-form-grid">

              {/* ================= BADGE ================= */}

              <div className="admin-hero-field admin-hero-field-full">

                <label htmlFor="hero-badge">
                  Badge
                </label>

                <input
                  id="hero-badge"
                  type="text"
                  value={
                    hero.badge
                  }
                  onChange={(event) =>
                    updateHero(
                      "badge",
                      event.target.value
                    )
                  }
                  placeholder="PREMIUM LAPTOPS & ACCESSORIES"
                  maxLength={120}
                  disabled={
                    saving ||
                    resetting
                  }
                />

                <span className="admin-hero-field-help">
                  Small text above the
                  main heading.
                </span>

              </div>


              {/* ================= TITLE ================= */}

              <div className="admin-hero-field admin-hero-field-full">

                <label htmlFor="hero-title">
                  Hero Heading *
                </label>

                <input
                  id="hero-title"
                  type="text"
                  value={
                    hero.title
                  }
                  onChange={(event) =>
                    updateHero(
                      "title",
                      event.target.value
                    )
                  }
                  placeholder="Technology That Fits Your World"
                  maxLength={200}
                  disabled={
                    saving ||
                    resetting
                  }
                />

              </div>


              {/* ================= DESCRIPTION ================= */}

              <div className="admin-hero-field admin-hero-field-full">

                <label htmlFor="hero-description">
                  Hero Description *
                </label>

                <textarea
                  id="hero-description"
                  rows="5"
                  value={
                    hero.description
                  }
                  onChange={(event) =>
                    updateHero(
                      "description",
                      event.target.value
                    )
                  }
                  placeholder="Write your Hero description..."
                  maxLength={1500}
                  disabled={
                    saving ||
                    resetting
                  }
                />

              </div>

            </div>

          </section>


          {/* =================================================
              BUTTONS
          ================================================= */}

          <section className="admin-hero-card">

            <div className="admin-hero-card-header">

              <div className="admin-hero-card-icon">
                <FaArrowLeft />
              </div>

              <div>

                <h2>
                  Hero Buttons
                </h2>

                <p>
                  Customize the actions
                  shown over the media.
                </p>

              </div>

            </div>

            <div className="admin-hero-form-grid">

              {/* ================= PRIMARY ================= */}

              <div className="admin-hero-subsection">

                <div className="admin-hero-subsection-heading">

                  <span>
                    PRIMARY BUTTON
                  </span>

                  <strong>
                    Main Call To Action
                  </strong>

                </div>

                <div className="admin-hero-field">

                  <label htmlFor="primary-button-text">
                    Button Text *
                  </label>

                  <input
                    id="primary-button-text"
                    type="text"
                    value={
                      hero.primary_button_text
                    }
                    onChange={(event) =>
                      updateHero(
                        "primary_button_text",
                        event.target.value
                      )
                    }
                    placeholder="View Products"
                    maxLength={80}
                    disabled={
                      saving ||
                      resetting
                    }
                  />

                </div>

                <div className="admin-hero-field">

                  <label htmlFor="primary-button-link">
                    Button Link *
                  </label>

                  <input
                    id="primary-button-link"
                    type="text"
                    value={
                      hero.primary_button_link
                    }
                    onChange={(event) =>
                      updateHero(
                        "primary_button_link",
                        event.target.value
                      )
                    }
                    placeholder="/products"
                    maxLength={500}
                    disabled={
                      saving ||
                      resetting
                    }
                  />

                </div>

              </div>


              {/* ================= SECONDARY ================= */}

              <div className="admin-hero-subsection">

                <div className="admin-hero-subsection-heading">

                  <span>
                    SECONDARY BUTTON
                  </span>

                  <strong>
                    Supporting Action
                  </strong>

                </div>

                <div className="admin-hero-field">

                  <label htmlFor="secondary-button-text">
                    Button Text *
                  </label>

                  <input
                    id="secondary-button-text"
                    type="text"
                    value={
                      hero.secondary_button_text
                    }
                    onChange={(event) =>
                      updateHero(
                        "secondary_button_text",
                        event.target.value
                      )
                    }
                    placeholder="Explore Categories"
                    maxLength={80}
                    disabled={
                      saving ||
                      resetting
                    }
                  />

                </div>

                <div className="admin-hero-field">

                  <label htmlFor="secondary-button-link">
                    Button Link *
                  </label>

                  <input
                    id="secondary-button-link"
                    type="text"
                    value={
                      hero.secondary_button_link
                    }
                    onChange={(event) =>
                      updateHero(
                        "secondary_button_link",
                        event.target.value
                      )
                    }
                    placeholder="/categories"
                    maxLength={500}
                    disabled={
                      saving ||
                      resetting
                    }
                  />

                </div>

              </div>

            </div>

          </section>


          {/* =================================================
              HERO IMAGE
          ================================================= */}

          <section className="admin-hero-card">

            <div className="admin-hero-card-header">

              <div className="admin-hero-card-icon">
                <FaImage />
              </div>

              <div>

                <h2>
                  Hero Image
                </h2>

                <p>
                  This image appears after
                  the Hero video finishes.
                </p>

              </div>

            </div>

            <div className="admin-hero-image-content">

              <div className="admin-hero-image-source-tabs">

                <button
                  type="button"
                  className={
                    imageSource ===
                    "url"
                      ? "admin-hero-source-button active"
                      : "admin-hero-source-button"
                  }
                  onClick={() =>
                    handleImageSourceChange(
                      "url"
                    )
                  }
                  disabled={
                    saving ||
                    resetting
                  }
                >
                  Image URL
                </button>

                <button
                  type="button"
                  className={
                    imageSource ===
                    "gallery"
                      ? "admin-hero-source-button active"
                      : "admin-hero-source-button"
                  }
                  onClick={() =>
                    handleImageSourceChange(
                      "gallery"
                    )
                  }
                  disabled={
                    saving ||
                    resetting
                  }
                >
                  Choose from Gallery
                </button>

              </div>


              {imageSource ===
                "url" && (
                <div className="admin-hero-field">

                  <label htmlFor="hero-image-url">
                    Image URL
                  </label>

                  <input
                    id="hero-image-url"
                    type="text"
                    value={
                      hero.image
                    }
                    onChange={(event) =>
                      updateHero(
                        "image",
                        event.target.value
                      )
                    }
                    placeholder="https://example.com/hero.jpg"
                    maxLength={8000000}
                    disabled={
                      saving ||
                      resetting
                    }
                  />

                </div>
              )}


              {imageSource ===
                "gallery" && (
                <div className="admin-hero-gallery-box">

                  <input
                    ref={
                      imageInputRef
                    }
                    id="hero-gallery-image"
                    type="file"
                    accept="image/*"
                    onChange={
                      handleGalleryImageChange
                    }
                    disabled={
                      saving ||
                      resetting
                    }
                    className="admin-hero-hidden-file-input"
                  />

                  <button
                    type="button"
                    className="admin-hero-gallery-button"
                    onClick={() =>
                      imageInputRef.current?.click()
                    }
                    disabled={
                      saving ||
                      resetting
                    }
                  >
                    <FaImage />

                    <span>
                      Choose Hero Image
                    </span>
                  </button>

                  <p>
                    JPG, JPEG, PNG, WEBP
                    and other image formats
                    up to 5 MB.
                  </p>

                  {selectedImageName && (
                    <div className="admin-hero-selected-image">

                      <FaCheck />

                      <span>
                        Selected:{" "}
                        {
                          selectedImageName
                        }
                      </span>

                    </div>
                  )}

                </div>
              )}


              <div className="admin-hero-image-preview-wrapper">

                <div className="admin-hero-preview-heading">

                  <strong>
                    Image Preview
                  </strong>

                  {hero.image && (
                    <button
                      type="button"
                      onClick={
                        handleClearImage
                      }
                      disabled={
                        saving ||
                        resetting
                      }
                    >
                      Remove Image
                    </button>
                  )}

                </div>

                <div className="admin-hero-image-preview">

                  {hero.image ? (
                    <img
                      src={
                        hero.image
                      }
                      alt="Hero"
                      onError={() =>
                        setError(
                          "The selected Hero image could not be loaded."
                        )
                      }
                    />
                  ) : (
                    <div className="admin-hero-no-image">

                      <FaImage />

                      <span>
                        No Hero image selected
                      </span>

                    </div>
                  )}

                </div>

              </div>

            </div>

          </section>


          {/* =================================================
              HERO VIDEO
          ================================================= */}

          <section className="admin-hero-card">

            <div className="admin-hero-card-header">

              <div className="admin-hero-card-icon">
                <FaVideo />
              </div>

              <div>

                <h2>
                  Hero Video
                </h2>

                <p>
                  This video plays first when
                  the homepage Hero loads.
                  After it ends, the Hero image
                  appears automatically.
                </p>

              </div>

            </div>


            {/* ================================================
                ENABLE VIDEO
            ================================================= */}

            <div className="admin-hero-toggle-content">

              <div>

                <strong>
                  Enable Hero Video
                </strong>

                <span>
                  Video plays once, muted and
                  automatically. After completion,
                  the image is displayed.
                </span>

              </div>

              <label className="admin-hero-switch">

                <input
                  type="checkbox"
                  checked={Boolean(
                    hero.video_enabled
                  )}
                  onChange={(event) =>
                    updateHero(
                      "video_enabled",
                      event.target.checked
                    )
                  }
                  disabled={
                    saving ||
                    resetting ||
                    !hero.video
                  }
                />

                <span className="admin-hero-switch-slider"></span>

              </label>

            </div>


            <div className="admin-hero-image-content">

              {/* ============================================
                  VIDEO SOURCE
              ============================================ */}

              <div className="admin-hero-image-source-tabs">

                <button
                  type="button"
                  className={
                    videoSource ===
                    "url"
                      ? "admin-hero-source-button active"
                      : "admin-hero-source-button"
                  }
                  onClick={() =>
                    handleVideoSourceChange(
                      "url"
                    )
                  }
                  disabled={
                    saving ||
                    resetting
                  }
                >
                  Video URL
                </button>

                <button
                  type="button"
                  className={
                    videoSource ===
                    "gallery"
                      ? "admin-hero-source-button active"
                      : "admin-hero-source-button"
                  }
                  onClick={() =>
                    handleVideoSourceChange(
                      "gallery"
                    )
                  }
                  disabled={
                    saving ||
                    resetting
                  }
                >
                  Choose from Gallery
                </button>

              </div>


              {/* ============================================
                  VIDEO URL
              ============================================ */}

              {videoSource ===
                "url" && (
                <div className="admin-hero-field">

                  <label htmlFor="hero-video-url">
                    Video URL
                  </label>

                  <input
                    id="hero-video-url"
                    type="text"
                    value={
                      hero.video
                    }
                    onChange={(event) =>
                      updateHero(
                        "video",
                        event.target.value
                      )
                    }
                    placeholder="https://example.com/hero-video.mp4"
                    maxLength={12000000}
                    disabled={
                      saving ||
                      resetting
                    }
                  />

                  <span className="admin-hero-field-help">
                    The video must be between
                    10 and 30 seconds. MP4/WebM
                    are recommended.
                  </span>

                </div>
              )}


              {/* ============================================
                  VIDEO GALLERY
              ============================================ */}

              {videoSource ===
                "gallery" && (
                <div className="admin-hero-gallery-box">

                  <input
                    ref={
                      videoInputRef
                    }
                    id="hero-gallery-video"
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/*"
                    onChange={
                      handleGalleryVideoChange
                    }
                    disabled={
                      saving ||
                      resetting ||
                      videoValidationLoading
                    }
                    className="admin-hero-hidden-file-input"
                  />

                  <button
                    type="button"
                    className="admin-hero-gallery-button"
                    onClick={() =>
                      videoInputRef.current?.click()
                    }
                    disabled={
                      saving ||
                      resetting ||
                      videoValidationLoading
                    }
                  >
                    <FaVideo />

                    <span>
                      {
                        videoValidationLoading
                          ? "Checking Video..."
                          : "Choose Hero Video"
                      }
                    </span>

                  </button>

                  <p>
                    MP4, WebM and MOV supported.
                    Maximum 8 MB. Duration must
                    be between 10 and 30 seconds.
                  </p>

                  {selectedVideoName && (
                    <div className="admin-hero-selected-image">

                      <FaCheck />

                      <span>
                        Selected:{" "}
                        {
                          selectedVideoName
                        }
                      </span>

                    </div>
                  )}

                  {videoDuration !== null && (
                    <div className="admin-hero-video-duration">

                      <FaVideo />

                      <span>
                        Duration:{" "}
                        {videoDuration.toFixed(
                          1
                        )}{" "}
                        seconds
                      </span>

                    </div>
                  )}

                </div>
              )}


              {/* ============================================
                  VIDEO PREVIEW
              ============================================ */}

              <div className="admin-hero-image-preview-wrapper">

                <div className="admin-hero-preview-heading">

                  <strong>
                    Video Preview
                  </strong>

                  {hero.video && (
                    <button
                      type="button"
                      onClick={
                        handleClearVideo
                      }
                      disabled={
                        saving ||
                        resetting
                      }
                    >
                      Remove Video
                    </button>
                  )}

                </div>

                <div className="admin-hero-video-preview">

                  {hero.video ? (
                    <video
                      src={
                        hero.video
                      }
                      controls
                      muted
                      playsInline
                      preload="metadata"
                      poster={
                        hero.image ||
                        undefined
                      }
                      onLoadedMetadata={(
                        event
                      ) => {
                        const duration =
                          Number(
                            event
                              .currentTarget
                              .duration
                          );

                        if (
                          Number.isFinite(
                            duration
                          ) &&
                          duration > 0
                        ) {
                          setVideoDuration(
                            duration
                          );
                        }
                      }}
                      onError={() =>
                        setError(
                          "The selected Hero video could not be loaded."
                        )
                      }
                    />
                  ) : (
                    <div className="admin-hero-no-image">

                      <FaVideo />

                      <span>
                        No Hero video selected
                      </span>

                    </div>
                  )}

                </div>

              </div>

            </div>

          </section>


          {/* =================================================
              MEDIA SETTINGS
          ================================================= */}

          <section className="admin-hero-card">

            <div className="admin-hero-card-header">

              <div className="admin-hero-card-icon">
                <FaEye />
              </div>

              <div>

                <h2>
                  Hero Media Settings
                </h2>

                <p>
                  Control how the Hero image
                  is positioned and how dark the
                  media overlay appears.
                </p>

              </div>

            </div>

            <div className="admin-hero-form-grid">

              <div className="admin-hero-field">

                <label htmlFor="hero-image-position">
                  Image Position
                </label>

                <select
                  id="hero-image-position"
                  value={
                    hero.image_position ||
                    "center"
                  }
                  onChange={(event) =>
                    updateHero(
                      "image_position",
                      event.target.value
                    )
                  }
                  disabled={
                    saving ||
                    resetting
                  }
                >
                  <option value="left center">
                    Left
                  </option>

                  <option value="center">
                    Center
                  </option>

                  <option value="right center">
                    Right
                  </option>

                  <option value="top center">
                    Top
                  </option>

                  <option value="bottom center">
                    Bottom
                  </option>
                </select>

              </div>


              <div className="admin-hero-field">

                <label htmlFor="hero-overlay">
                  Overlay Darkness
                </label>

                <div className="admin-hero-range-row">

                  <input
                    id="hero-overlay"
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={
                      Number.isFinite(
                        Number(
                          hero.overlay_opacity
                        )
                      )
                        ? hero.overlay_opacity
                        : 0.78
                    }
                    onChange={(event) =>
                      updateHero(
                        "overlay_opacity",
                        Number(
                          event.target.value
                        )
                      )
                    }
                    disabled={
                      saving ||
                      resetting
                    }
                  />

                  <strong>
                    {Math.round(
                      Number(
                        hero.overlay_opacity ||
                          0
                      ) * 100
                    )}
                    %
                  </strong>

                </div>

              </div>

            </div>

          </section>


          {/* =================================================
              BOTTOM ACTIONS
          ================================================= */}

          <div className="admin-hero-bottom-actions">

            <button
              type="button"
              className="admin-hero-discard-button"
              onClick={
                handleDiscard
              }
              disabled={
                saving ||
                resetting
              }
            >
              <FaTimes />

              Discard Changes
            </button>

            <button
              type="button"
              className="admin-hero-save-button admin-hero-save-button-bottom"
              onClick={
                handleSave
              }
              disabled={
                saving ||
                resetting ||
                videoValidationLoading
              }
            >
              <FaSave />

              {saving ||
              videoValidationLoading
                ? "Saving..."
                : "Save Changes"}

            </button>

          </div>

        </div>


        {/* ==================================================
            LIVE PREVIEW MODAL
        ================================================== */}

        {showPreview && (
          <div
            className="admin-hero-preview-overlay"
            onClick={
              handleClosePreview
            }
          >

            <div
              className="admin-hero-preview-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              {/* ============================================
                  PREVIEW HEADER
              ============================================ */}

              <div className="admin-hero-preview-modal-header">

                <div>

                  <span>
                    LIVE PREVIEW
                  </span>

                  <h2>
                    Homepage Hero Preview
                  </h2>

                </div>

                <button
                  type="button"
                  onClick={
                    handleClosePreview
                  }
                  aria-label="Close preview"
                >
                  <FaTimes />
                </button>

              </div>


              {/* ============================================
                  HERO MEDIA
              ============================================ */}

              <div
                className="admin-hero-live-preview"
                style={previewStyle}
              >

                {/* ==========================================
                    VIDEO
                    Plays ONCE
                ========================================== */}

                {previewMedia ===
                  "video" &&
                  hero.video_enabled &&
                  hero.video && (

                    <video
                      ref={
                        previewVideoRef
                      }
                      className="admin-hero-live-preview-video"
                      src={
                        hero.video
                      }
                      autoPlay
                      muted
                      playsInline
                      preload="auto"
                      onEnded={
                        handlePreviewVideoEnded
                      }
                      onError={
                        handlePreviewVideoError
                      }
                    />

                  )}


                {/* ==========================================
                    IMAGE
                    Appears after video
                ========================================== */}

                {previewMedia ===
                  "image" &&
                  hero.image && (
                    <div
                      className="admin-hero-live-preview-image"
                      style={{
                        backgroundImage:
                          `url("${hero.image}")`,
                        backgroundPosition:
                          hero.image_position ||
                          "center",
                      }}
                    />
                  )}


                {/* ==========================================
                    FALLBACK GRADIENT
                ========================================== */}

                {!hero.image &&
                  previewMedia ===
                    "image" && (
                    <div className="admin-hero-live-preview-fallback"></div>
                  )}


                {/* ==========================================
                    DARK OVERLAY
                ========================================== */}

                <div
                  className="admin-hero-live-preview-overlay"
                  style={{
                    opacity:
                      Number(
                        hero.overlay_opacity
                      ) || 0.78,
                  }}
                ></div>


                {/* ==========================================
                    HERO TEXT
                    ALWAYS ABOVE MEDIA
                ========================================== */}

                <div className="admin-hero-live-preview-content">

                  {hero.badge && (
                    <span className="admin-hero-live-preview-badge">
                      {hero.badge}
                    </span>
                  )}

                  <h3>
                    {hero.title ||
                      "Technology That Fits Your World"}
                  </h3>

                  <p>
                    {hero.description ||
                      "Discover reliable laptops, gaming machines and essential accessories for work, study, gaming and everyday life."}
                  </p>

                  <div className="admin-hero-live-preview-buttons">

                    <button
                      type="button"
                      className="admin-hero-live-primary-button"
                    >
                      {hero.primary_button_text ||
                        "View Products"}
                    </button>

                    <button
                      type="button"
                      className="admin-hero-live-secondary-button"
                    >
                      {hero.secondary_button_text ||
                        "Explore Categories"}
                    </button>

                  </div>

                </div>

              </div>


              {/* ============================================
                  PREVIEW STATUS
              ============================================ */}

              <div className="admin-hero-preview-sequence-status">

                {hero.video_enabled &&
                hero.video ? (
                  previewMedia ===
                  "video" ? (
                    <span>
                      ● Video is playing first — image
                      will appear automatically when it
                      finishes.
                    </span>
                  ) : (
                    <span>
                      ✓ Video finished — Hero image is
                      now displayed.
                    </span>
                  )
                ) : (
                  <span>
                    Hero image is displayed because
                    background video is disabled.
                  </span>
                )}

              </div>


              {/* ============================================
                  PREVIEW FOOTER
              ============================================ */}

              <div className="admin-hero-preview-modal-footer">

                <button
                  type="button"
                  className="admin-hero-discard-button"
                  onClick={
                    handleClosePreview
                  }
                >
                  Close Preview
                </button>

                <button
                  type="button"
                  className="admin-hero-save-button"
                  onClick={async () => {
                    await handleSave();
                  }}
                  disabled={
                    saving ||
                    resetting ||
                    videoValidationLoading
                  }
                >
                  <FaSave />

                  {saving ||
                  videoValidationLoading
                    ? "Saving..."
                    : "Save Hero"}

                </button>

              </div>

            </div>

          </div>
        )}

      </div>

    </AdminLayout>
  );
};

export default AdminHero;