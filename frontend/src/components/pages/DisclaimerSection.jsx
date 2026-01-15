
import { useTranslation } from "react-i18next";

const DisclaimerSection = () => {


    const { t, i18n } = useTranslation();
    const isChinese = i18n.language.startsWith("zh");

    const disclaimer = isChinese
        ? {
            title: "免責聲明",
            intro: "本系統僅提供足球比賽數據分析、統計模型及人工智能預測，純屬娛樂及參考用途，不構成任何投注建議、投資建議或財務建議。",
            items: [
                { num: 1, heading: "不保證準確性", desc: "本平台之所有預測、概率、評分均基於歷史數據及演算法產生，不保證準確、完整或及時。足球比賽結果受多種不可控因素影響，過往表現不代表未來結果。" },
                { num: 2, heading: "禁止用於非法博彩", desc: "根據《博彩條例》（香港法例第148章），除香港賽馬會（HKJC）外，任何人士不得經營或參與非法博彩活動。用戶嚴禁將本平台資料用於任何非法投注、莊家交易或跨境博彩平台。違者須自負法律責任，本公司概不負責。" },
                { num: 3, heading: "用戶責任", desc: "用戶須自行判斷並承擔使用本平台之一切風險，包括但不限於財務損失。本公司不就任何直接、間接、附帶或後果性損害承擔責任。" },
                { num: 4, heading: "知識產權", desc: "本平台所有內容（包括但不限於數據、圖表、演算法）受版權及知識產權法保護，未經書面授權不得複製或商業用途。" },
                { num: 5, heading: "私隱承諾", desc: "本公司遵守《個人資料（私隱）條例》（第486章），詳情見《私隱政策》。" },
            ],
        }
        : {
            title: "Disclaimer",
            intro: "This platform provides football match data analysis, statistical models, and AI predictions for entertainment and reference purposes only. It does not constitute betting advice, investment advice, or financial recommendation.",
            items: [
                { num: 1, heading: "No Guarantee of Accuracy", desc: "All predictions, probabilities, and ratings are generated based on historical data and algorithms. No accuracy, completeness, or timeliness is guaranteed. Football outcomes are subject to uncontrollable factors; past performance is not indicative of future results." },
                { num: 2, heading: "Prohibited Use in Illegal Gambling", desc: "Under the Gambling Ordinance (Cap. 148, Laws of Hong Kong), no person may operate or participate in illegal bookmaking except through the Hong Kong Jockey Club (HKJC). Users are strictly prohibited from using platform data for illegal betting, bookmaking, or offshore gambling platforms. Users bear full legal responsibility for violations." },
                { num: 3, heading: "User Responsibility", desc: "Users must exercise independent judgment and assume all risks, including financial losses. The Company shall not be liable for any direct, indirect, incidental, or consequential damages." },
                { num: 4, heading: "Intellectual Property", desc: "All content is protected by copyright and intellectual property laws. Unauthorized reproduction or commercial use is prohibited." },
                { num: 5, heading: "Privacy Commitment", desc: "We comply with the Personal Data (Privacy) Ordinance (Cap. 486). See Privacy Policy for details." },
            ],
        };

    const leftItems = disclaimer.items.slice(0, 2);
    const rightItems = disclaimer.items.slice(2);

    return (
        <div
            className="fancy-feature-nineteen position-relative pt-0 lg-pt-0 pb-24 lg-pb-32"
            style={{ backgroundColor: "#0a0a0a", minHeight: "100vh", overflow: "hidden" }}
        // data-aos="fade-up"
        >
            <div className="container">
                <div className="row">
                    <div className="col-lg-6 col-md-7">
                        <div className="block-style-thirteen" data-aos="fade-right">
                            <div className="title-style-three pb-15">
                                <div className="sc-title text-white opacity-50">DISCLAIMER</div>
                                <h2 className="main-title text-white">{disclaimer.title}</h2>
                            </div>

                            <p className="text-light opacity-90 mb-30" style={{ fontSize: "14px", lineHeight: "1.7" }}>
                                {disclaimer.intro}
                            </p>


                            <ul className="style-none list-item">
                                {leftItems.map((item, i) => (
                                    <li key={i}
                                    //    data-aos="fade-up" 
                                    //   data-aos-delay={i * 50}
                                    >
                                        <div className="numb tran3s">{item.num}</div>
                                        <h6 className="text-white">{item.heading}</h6>
                                        <span className="text-light opacity-85" style={{ fontSize: "13.5px" }}>
                                            {item.desc}
                                        </span>
                                    </li>
                                ))}

                                {rightItems.map((item, i) => (
                                    <li
                                        key={i + 2}
                                        className="d-lg-none"
                                    // data-aos="fade-up"
                                    // data-aos-delay={(i + 2) * 50}
                                    >
                                        <div className="numb tran3s">{item.num}</div>
                                        <h6 className="text-white">{item.heading}</h6>
                                        <span className="text-light opacity-85" style={{ fontSize: "13.5px" }}>
                                            {item.desc}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="col-lg-6 d-none d-lg-block">
                        <div className="block-style-thirteen ms-lg-5" data-aos="fade-left">
                            <ul className="style-none list-item mt-lg-5">
                                {rightItems.map((item, i) => (
                                    <li key={i} data-aos="fade-up" data-aos-delay={i * 50}>
                                        <div className="numb tran3s">{item.num}</div>
                                        <h6 className="text-white">{item.heading}</h6>
                                        <span className="text-light opacity-85" style={{ fontSize: "13.5px" }}>
                                            {item.desc}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>


            <div style={{ flex: "display", height: 70 }} />
        </div>
    );
};

export default DisclaimerSection;