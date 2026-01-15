import React, { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, handleApiError } from "../../utils/api";
import useAuthStore from "../../store/authStore";

const AdminLoginForm = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const response = await api.post("/admin/login", {
        username,
        password,
        expectedRole: "main", // Ensure only main admin can login through this form
      });

      if (response.status === 200 && response.data.token) {
        // Verify that the role is actually "main"
        if (response.data.role !== "main") {
          setError(t("無效的憑證類型"));
          return;
        }
        // Save token to localStorage and set auth state
        login(response.data.role, response.data.token, response.data.username);
        // Navigate to admin dashboard
        navigate("/admin", { replace: true });
      }
    } catch (err) {
      const message = handleApiError(err, navigate);
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const status = err.response.status;
        if (status === 401) {
          setError(t("用戶名或密碼錯誤"));
        } else if (status === 403) {
          setError(t("無效的憑證類型，請使用主管理員帳號"));
        } else if (status === 402) {
          setError(t("支付要求錯誤，請聯繫管理員") || message);
        } else if (status === 404) {
          setError(t("管理員未找到"));
        } else {
          setError(message || t("登錄時出錯"));
        }
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(message || t("登錄時出錯"));
      }
    }
  };

  return (
    <Fragment>
      <form id="contact-form" action="#" onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-12">
            <div className="input-group-meta form-group mb-30">
              <label>{t("用戶名")}*</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={error ? "is-invalid" : ""}
                autoComplete="username"
              />
            </div>
          </div>
          <div className="col-12">
            <div className="input-group-meta form-group mb-30">
              <label>{t("密碼")}*</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={error ? "is-invalid" : ""}
              />
            </div>
          </div>
          {error && (
            <div className="col-12">
              <div className="invalid-feedback">{error}</div>
            </div>
          )}
          <div className="col-12 mt-3">
            <button className="btn-eight ripple-btn" type="submit">
              {t("登錄")}
            </button>
          </div>
        </div>
      </form>
    </Fragment>
  );
};

export default AdminLoginForm;
