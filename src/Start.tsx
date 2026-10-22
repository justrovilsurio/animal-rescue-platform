import { Link } from 'react-router-dom';
import { useStore } from './state/store';
import { StatusBadge } from './ui/StatusBadge';
import { Icon } from './ui/Icon';

/** Prototype landing: the two doors into the product. Not part of the real product. */
export function Start() {
  const { state } = useStore();
  const live = Boolean(state.page.publishedAt);
  return (
    <main className="kd-start">
      <p className="kd-start__brand">Kindred</p>
      <h1 className="kd-start__title">A warm, shareable page for every rescue group.</h1>
      <p className="kd-start__lede">Working prototype. Everything you change is saved in this browser.</p>
      <div className="kd-start__doors">
        <Link className="kd-door" to={`/${state.page.slug}`}>
          <Icon name="home" size={24} />
          <span className="kd-door__title">Visitor view</span>
          <span className="kd-door__body">{state.page.name}’s public page, the way an adopter sees it.</span>
          <StatusBadge status={live ? 'live' : 'private'}>{live ? 'Page is live' : 'Private until published'}</StatusBadge>
        </Link>
        <Link className="kd-door" to="/dashboard">
          <Icon name="layout" size={24} />
          <span className="kd-door__title">Group dashboard</span>
          <span className="kd-door__body">Edit the page, add animals, publish drafts. Sign-in comes with the backend.</span>
        </Link>
      </div>
    </main>
  );
}
