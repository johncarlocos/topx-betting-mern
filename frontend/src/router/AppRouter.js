import React, { Fragment, Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedMemberRoute from "../components/common/ProtectedMemberRoute";

// Lazy load components for code splitting and better performance
const Landing = lazy(() => import("../views/Landing"));
const Login = lazy(() => import("../components/form/Login"));
const ViewMatches = lazy(() => import("../components/matches/ViewMatches"));
const MatchResult = lazy(() => import("../components/matches/MatchResult"));
const NotFound = lazy(() => import("../views/NotFound"));
const DeveloperPage = lazy(() => import("../components/developer/DeveloperPage"));
const AdminLogin = lazy(() => import("../components/admin/AdminLogin"));
const SubAdminLogin = lazy(() => import("../components/admin/SubAdminLogin"));
const AdminDashboard = lazy(() => import("../components/admin/AdminDashboard"));
const ManageMembers = lazy(() => import("../components/admin/ManageMembers"));
const ManageAdmins = lazy(() => import("../components/admin/ManageAdmins"));

// Loading component
const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    background: '#0a0a0a',
    color: '#32cd32'
  }}>
    Loading...
  </div>
);

const AppRouter = () => {
  return (
    <Fragment>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/subadmin/login" element={<SubAdminLogin />} />
          <Route
            path="*"
            element={
              <MainLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/admin" element={<Landing />} />
                    <Route path="/subadmin" element={<Landing />} />
                    <Route
                      path="/view-matches"
                      element={
                        <ProtectedMemberRoute>
                          <ViewMatches />
                        </ProtectedMemberRoute>
                      }
                    />
                    <Route path="/record-matches" element={<ViewMatches />} />
                    <Route path="/match-result/:id" element={<MatchResult />} />
                    <Route path="/developer/language" element={<DeveloperPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </MainLayout>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <AdminDashboard />
                </Suspense>
              </AdminLayout>
            }
          />
          <Route
            path="/admin/manage-members"
            element={
              <AdminLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <ManageMembers />
                </Suspense>
              </AdminLayout>
            }
          />
          <Route
            path="/admin/manage-admins"
            element={
              <AdminLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <ManageAdmins />
                </Suspense>
              </AdminLayout>
            }
          />
          <Route
            path="/subadmin"
            element={
              <AdminLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <AdminDashboard />
                </Suspense>
              </AdminLayout>
            }
          />
          <Route
            path="/subadmin/manage-members"
            element={
              <AdminLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <ManageMembers />
                </Suspense>
              </AdminLayout>
            }
          />
          <Route
            path="/subadmin/manage-admins"
            element={
              <AdminLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <ManageAdmins />
                </Suspense>
              </AdminLayout>
            }
          />
        </Routes>
      </Suspense>
    </Fragment>
  );
};

export default AppRouter;
