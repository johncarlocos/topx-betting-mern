import React, { Fragment } from "react";
import { Helmet } from "react-helmet";
import HeroBanner from "../components/pages/HeroBanner";
import Explore from "../components/pages/Explore";
import Analysis from "../components/pages/Analysis";
import HowWorks from "../components/pages/HowWorks";
import CounterOne from "../components/pages/CounterOne";
import MultiPlatform from "../components/pages/MultiPlatform";
import Contact from "../components/pages/Contact";
import Footer from "../components/footer/Footer";
import { useTranslation } from "react-i18next";


import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useState } from "react";
import { pad } from "lodash";
import DisclaimerSection from "../components/pages/DisclaimerSection";

const PrevArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    style={{
      position: "absolute",
      left: "30px",
      top: "50%",
      transform: "translateY(-50%)",
      zIndex: 2,
      background: "white",
      border: "none",
      borderRadius: "50%",
      width: "40px",
      height: "40px",
      color: "black",
      fontSize: "20px",
      fontWeight: "bold",
      cursor: "pointer",
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    }}
  >
    ‹
  </button>
);

const NextArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    style={{
      position: "absolute",
      right: "30px",
      top: "50%",
      transform: "translateY(-50%)",
      zIndex: 2,
      background: "white",
      border: "none",
      borderRadius: "50%",
      width: "40px",
      height: "40px",
      color: "black",
      fontSize: "20px",
      fontWeight: "bold",
      cursor: "pointer",
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    }}
  >
    ›
  </button>
);

const images = [
  "/images/assets/1.jpg",
  "/images/assets/2.jpg",
  "/images/assets/3.jpg",
  "/images/assets/4.jpg",
  "/images/assets/5.jpg",
  "/images/assets/6.jpg",
  "/images/assets/7.jpg",
  "/images/assets/8.jpeg",
  "/images/assets/9.jpg",
  "/images/assets/10.jpg",
  "/images/assets/11.jpg",
  "/images/assets/12.jpg",
  "/images/assets/13.jpg",
];

const ImageCarousel = () => {

  const isSmartphone = () => {
    return window.innerWidth <= 767;
  };


  const [currentSlide, setCurrentSlide] = useState(0);

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    centerMode: true,
    centerPadding: "0px",
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    beforeChange: (oldIndex, newIndex) => setCurrentSlide(newIndex),
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
          centerMode: true,
          centerPadding: "0",
        },
      },
    ],
  };

  return (
    <div style={{ width: "100%", overflow: "visible", position: "relative" }} data-aos="fade-left">
      <Slider {...settings}>
        {images.map((img, index) => (
          <div key={index} style={{ padding: "0 0px" }}>
            <div
              style={{
                paddingTop: 70,
                paddingBottom: 70,
                transform:
                  index === currentSlide ? isSmartphone() ? "scale(1.5)" : "scale(0.9)" : isSmartphone() ? "scale(0.85)" : "scale(0.75)",
                opacity: index === currentSlide ? 1 : 0.6,
                transition: "transform 0.3s ease, opacity 0.3s ease",
                position: "relative",
                zIndex: index === currentSlide ? 10 : 1,
                width: "100%",
                margin: "0",
              }}
            >
              <img
                src={img}
                alt={`slide-${index + 1}`}
                loading="lazy"
                style={{
                  width: "100%",
                  height: "auto",
                  borderRadius: index === currentSlide ? "8px" : "14px",
                  objectFit: "cover",
                  boxShadow: index === currentSlide
                    ? "0 8px 16px rgba(0,0,0,0.2)"
                    : "0 4px 12px rgba(0,0,0,0.1)",
                }}
                onError={(e) => {
                  console.error(`Failed to load image: ${img}`);
                }}
              />
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );

};

const Landing = () => {
  const { t } = useTranslation();
  return (
    <Fragment>
      <div className="main-page-wrapper">
        <Helmet>
          <title>TOP X</title>
        </Helmet>
        <HeroBanner />

        <div className="title-style-three ml-50 mb-20" data-aos="fade-left"
          style={{ marginTop: -90, marginLeft: 30 }}>
          <div className="sc-title">Over 1000+ Client</div>

          <h2 className="main-title"
            style={{ marginLeft: 18 }}>
            <span>{"別人成功"}</span>
            <br></br>
            {"你都可以"}
          </h2>
        </div>
        <ImageCarousel />


        <div className="fancy-feature-seventeen position-relative mt-160 xl-mt-20"
          style={{ marginTop: 20 }}>
          <div className="container">
            <div className="row align-items-center">
              <div className="col-xl-6 col-lg-5" data-aos="fade-right">
                <div className="title-style-three text-lg-start">
                  <h2 className="main-title">
                    <span>{t("探索")}</span> {t("我們的")}
                    <br />
                    {t("核心技術和實際應用")}
                  </h2>
                </div>
              </div>
            </div>
            <Explore />
          </div>
          <div className="shapes shape-one" />
        </div>

        <Analysis />

        <div className="fancy-feature-nineteen position-relative pt-130 lg-pt-80">
          <div className="container">
            <div className="row">
              <div className="col-xxl-5 col-lg-6 col-md-7">
                <HowWorks />
              </div>
            </div>
          </div>
          <div className="illustration-holder" data-aos="fade-left">
            <img
              src="images/assets/ils_15.svg"
              alt=""
              className="w-100 main-illustration"
            />
            <img
              src="images/assets/ils_15_1.svg"
              alt=""
              className="shapes shape-one"
            />
            <img
              src="images/assets/ils_15_2.svg"
              alt=""
              className="shapes shape-two"
            />
            <img
              src="images/assets/ils_15_3.svg"
              alt=""
              className="shapes shape-three"
            />
            <img
              src="images/assets/ils_15_4.svg"
              alt=""
              className="shapes shape-four"
            />
            <img
              src="images/assets/ils_15_5.svg"
              alt=""
              className="shapes shape-five"
              data-aos="fade-down"
              data-aos-delay={200}
              data-aos-duration={2000}
            />
            <img
              src="images/assets/ils_15_6.svg"
              alt=""
              className="shapes shape-six"
              data-aos="fade-down"
              data-aos-delay={100}
              data-aos-duration={2000}
            />
            <img
              src="images/assets/ils_15_7.svg"
              alt=""
              className="shapes shape-seven"
              data-aos="fade-down"
              data-aos-duration={2000}
            />
          </div>
          <div className="shapes oval-one" />
          <div className="shapes oval-two" />
        </div>

        <CounterOne />
        <MultiPlatform />

        <Contact />

        <DisclaimerSection />

        <Footer />
      </div>
    </Fragment >
  );
};

export default Landing;