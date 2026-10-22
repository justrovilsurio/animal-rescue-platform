import { Route, Routes } from 'react-router-dom';
import { PublicSite } from './public/PublicSite';
import { Dashboard } from './dashboard/Dashboard';
import { Start } from './Start';

/**
 * Route map
 *   /                         prototype start page
 *   /:slug                    public group page (visitors)
 *   /:slug/adopt/:id          animal detail overlay (shareable)
 *   /dashboard/...            group dashboard
 *   /dashboard/preview/...    the public page as the group sees it, drafts included
 */
export function App() {
  return (
    <Routes>
      <Route path="/" element={<Start />} />
      <Route path="/dashboard/preview/*" element={<PublicSite preview />} />
      <Route path="/dashboard/*" element={<Dashboard />} />
      <Route path="/:slug/*" element={<PublicSite />} />
    </Routes>
  );
}
