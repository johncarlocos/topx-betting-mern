import React, { Fragment } from "react";
import { useTranslation } from "react-i18next";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const PortfolioContent = (t) => [
  {
    img: "image1",
    tag: t("社群分享"),
    link: "https://t.me/topxhk_ai",
    plus: "bi bi-plus",
  },
  {
    img: "image2",
    tag: t("動態更新"),
    link: "https://www.instagram.com/topxhk.ai/",
    plus: "bi bi-plus",
  },
  {
    img: "image3",
    tag: t("分析紀錄"),
    link: "https://www.threads.com/@topxhk.ai",
    plus: "bi bi-plus",
  },
];

const settings = {
  dots: false,
  infinite: true,
  speed: 100,
  autoplay: true,
  autoplaySpeed: 2000,
  slidesToShow: 3,
  slidesToScroll: 1,
  arrows: false,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 3,
        infinite: true,
      },
    },
    {
      breakpoint: 767,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 2,
        initialSlide: 2,
      },
    },
    {
      breakpoint: 575,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
      },
    },
  ],
};

const PortfolioGallery = () => {
  const { t } = useTranslation();

  return (
    <Fragment>
      <Slider {...settings} className="portfolio_slider_one">
        {PortfolioContent(t).map((val, i) => (
          <div key={i} className="item">
            <a href={val.link} target="_blank" className="portfolio-block-one">
              <div className="img-meta">
                <img
                  src={`/images/gallery/${val.img}.jpg`}
                  alt={val.tag}
                  className="w-100"
                  onError={(e) => {
                    console.error(`Failed to load image: /images/gallery/${val.img}.jpg`);
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            </a>
            <div style={{ textAlign: "center" }}>{val.tag}</div>
          </div>
        ))}
      </Slider>
    </Fragment>
  );
};

export default PortfolioGallery;
