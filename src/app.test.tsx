import { describe, it, expect } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useNavigate, type NavigateFunction } from 'react-router-dom';
import { App } from './App';
import { StoreProvider } from './state/store';
import { ToastProvider } from './ui/Toast';
import { LocalStorageRepository, STORAGE_KEY } from './data/repository';
import { seedState } from './data/seed';

/** Render the whole app at a path, and hand back a navigate() for moving around. */
function setup(path: string) {
  let nav: NavigateFunction = () => {};
  function Grab() { nav = useNavigate(); return null; }
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={[path]}>
      <ToastProvider>
        <StoreProvider repo={new LocalStorageRepository(localStorage)}>
          <Grab />
          <App />
        </StoreProvider>
      </ToastProvider>
    </MemoryRouter>,
  );
  const go = (to: string) => act(() => { nav(to); });
  return { user, go };
}

async function publishPage(user: ReturnType<typeof userEvent.setup>, go: (to: string) => void) {
  go('/dashboard');
  await user.click(await screen.findByRole('button', { name: 'Publish page' }));
}

describe('page privacy', () => {
  it('is private to visitors until the first publish', async () => {
    const { user, go } = setup('/second-wind');
    expect(screen.getByText("This page isn't public yet")).toBeInTheDocument();
    await publishPage(user, go);
    go('/second-wind');
    expect(screen.getByRole('heading', { level: 1, name: 'Second Wind Rescue' })).toBeInTheDocument();
  });

  it('shows visitors only published versions: no drafts, and the old copy of edited items', async () => {
    const { user, go } = setup('/dashboard');
    await publishPage(user, go);
    go('/second-wind/rescues');
    const gallery = screen.getByRole('main');
    expect(within(gallery).queryByText('Juniper')).not.toBeInTheDocument(); // never-published draft
    expect(within(gallery).getByText('Patch')).toBeInTheDocument(); // published, with pending edits
    expect(within(gallery).queryByText('Rescued 30 Aug 2026')).not.toBeInTheDocument(); // the pending edit
  });

  it('Preview shows drafts with their status', async () => {
    const { go } = setup('/dashboard');
    go('/dashboard/preview/rescues');
    expect(screen.getByText('Juniper')).toBeInTheDocument();
    expect(screen.getAllByText('Draft').length).toBeGreaterThan(0);
  });
});

describe('editing a published animal', () => {
  it('keeps the live page unchanged until "Publish update"', async () => {
    const { user, go } = setup('/dashboard');
    await publishPage(user, go);

    go('/dashboard/edit/adopt/mango');
    const location = screen.getByLabelText('Public location');
    await user.clear(location);
    await user.type(location, 'Marikina');
    expect(screen.getAllByText('Unpublished edits').length).toBeGreaterThan(0);

    go('/second-wind/adopt/mango');
    let dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Pasig')).toBeInTheDocument();

    go('/dashboard/edit/adopt/mango');
    await user.click(screen.getByRole('button', { name: 'Publish update' }));
    expect(await screen.findByText("Mango's update is live.")).toBeInTheDocument();

    go('/second-wind/adopt/mango');
    dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Marikina')).toBeInTheDocument();
  });

  it('Discard edits restores the published version', async () => {
    const { user, go } = setup('/dashboard/edit/adopt/mango');
    const name = screen.getByLabelText('Name');
    await user.type(name, 'xx');
    await user.click(screen.getByRole('button', { name: 'Discard edits' }));
    expect(screen.getByLabelText('Name')).toHaveValue('Mango');
    expect(screen.getAllByText('Published').length).toBeGreaterThan(0);
    void go;
  });
});

describe('publishing a new animal', () => {
  it('blocks publishing until there is a name and a cover photo, and says why', async () => {
    const { user } = setup('/dashboard/animals');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    await user.click(screen.getByRole('button', { name: 'Publish' }));
    expect(screen.getByText('Give them a name, even a temporary one.')).toBeInTheDocument();
    expect(screen.getByText('Add a cover photo. It is what visitors see first.')).toBeInTheDocument();
    expect(screen.getByText(/Fix 2 things before publishing/)).toBeInTheDocument();
    expect(screen.getAllByText('Draft').length).toBeGreaterThan(0);
  });

  it('turns a free-text age into a filter band and tells the group which', async () => {
    const { user } = setup('/dashboard/animals');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    await user.type(screen.getByLabelText('Approximate age'), '8 weeks');
    expect(screen.getByText('Shows up in the “Under 6 months” filter.')).toBeInTheDocument();
  });
});

describe('section visibility', () => {
  it('hides a section from visitors immediately, with Undo', async () => {
    const { user, go } = setup('/dashboard');
    await publishPage(user, go);
    await user.click(screen.getByRole('switch', { name: 'Events' }));
    go('/second-wind');
    expect(screen.queryByRole('heading', { name: 'Events' })).not.toBeInTheDocument();

    go('/dashboard');
    await user.click(screen.getByRole('switch', { name: 'Events' }));
    expect(screen.getByRole('switch', { name: 'Events' })).toHaveAttribute('aria-checked', 'true');
    go('/second-wind');
    expect(screen.getByRole('heading', { name: 'Events' })).toBeInTheDocument();
  });
});

describe('adoption gallery', () => {
  it('filters by animal type and shows a helpful empty state', async () => {
    const { user, go } = setup('/dashboard');
    await publishPage(user, go);
    go('/second-wind/adopt');
    await user.click(screen.getByRole('button', { name: 'Cats' }));
    expect(screen.getByText('Saffron')).toBeInTheDocument();
    expect(screen.queryByText('Mango')).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Location'), 'Antipolo');
    expect(screen.getByText('No animals match those filters')).toBeInTheDocument();
    await user.click(screen.getAllByRole('button', { name: 'Clear filters' })[0]);
    expect(screen.getByText('Mango')).toBeInTheDocument();
  });

  it('opens a shared animal link as a dialog that Escape closes back to the gallery', async () => {
    const { user, go } = setup('/dashboard');
    await publishPage(user, go);
    go('/second-wind/adopt/kiko');
    const dialog = await screen.findByRole('dialog', { name: 'Kiko' });
    expect(within(dialog).getByRole('link', { name: /Email about Kiko/ })).toHaveAttribute('href', expect.stringContaining('mailto:hello@secondwind.ph'));
    await user.keyboard('{Escape}');
    await act(() => new Promise((r) => setTimeout(r, 250)));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'For Adoption' })).toBeInTheDocument();
  });
});

describe('new community sections', () => {
  it('shows Before you adopt, adopter updates and the team to visitors, but not their drafts', async () => {
    const { user, go } = setup('/dashboard');
    await publishPage(user, go);
    go('/second-wind');
    expect(await screen.findByRole('heading', { level: 2, name: 'Before you adopt' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'A lifetime commitment' })).toBeInTheDocument();

    const updates = screen.getByRole('region', { name: 'Updates from adopters' });
    expect(within(updates).getByText('Koda · from the Reyes family · Sep 2026')).toBeInTheDocument();
    expect(within(updates).getByText(/more photos/)).toBeInTheDocument(); // five photos: three shown, "+2"

    const team = screen.getByRole('region', { name: 'Meet our team' });
    expect(within(team).getByRole('heading', { name: 'Ana' })).toBeInTheDocument();
    expect(within(team).queryByRole('heading', { name: 'Paolo' })).not.toBeInTheDocument(); // draft
  });
});

describe('sample entries', () => {
  it('fills an empty team list with sample drafts, without touching anything else', async () => {
    // A save from before "Meet our team" existed: the migration leaves the team empty.
    const { team: _t, prepare: _p, ...v1Entries } = seedState().entries;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...seedState(), version: 1, entries: v1Entries }));
    const { user } = setup('/dashboard/community?show=team');

    await user.click(await screen.findByRole('button', { name: 'Add sample entries' }));
    for (const name of ['Ana', 'Jomar', 'Bea']) expect(screen.getByText(name)).toBeInTheDocument();
    expect(screen.getAllByText('Draft')).toHaveLength(3); // drafts only: visitors see nothing until published
  });
});
