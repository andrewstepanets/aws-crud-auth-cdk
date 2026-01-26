import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import { Layout } from '../components/layout';
import { Loader } from '../components/loader';

const MainPage = lazy(() => import('../pages/main'));
const ScenarioAdd = lazy(() => import('../pages/scenario-add'));
const ScenarioView = lazy(() => import('../pages/scenario-view'));
const ScenarioEdit = lazy(() => import('../pages/scenario-edit'));

export function AppRoutes() {
    return (
        <Suspense fallback={<Loader />}>
            <Routes>
                <Route element={<Layout />}>
                    <Route path="/" element={<MainPage />} />
                    <Route path="/add" element={<ScenarioAdd />} />
                    <Route path="/:id/view" element={<ScenarioView />} />
                    <Route path="/:id/edit" element={<ScenarioEdit />} />
                </Route>
            </Routes>
        </Suspense>
    );
}
