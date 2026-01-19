import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom'

import Footer from 'src/components/layout/Footer';

import Button from 'src/components/presets/Button';
import { Headline2, Subheading, Body1 } from 'src/components/presets/Typography';

import 'src/css/pages/HomePage.css';

type SavedGame = {
  id: string;
  title: string;
  updatedAt: number; // unix ms
};

const STORAGE_KEY = 'trivia_saved_games';

function loadSavedGames(): SavedGame[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedGame[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatDate(ms: number) {
  try {
    return new Date(ms).toLocaleString();
  } catch {
    return '';
  }
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [savedGames, setSavedGames] = useState<SavedGame[]>(() => loadSavedGames());
  const [selectedId, setSelectedId] = useState<string>('');

  const selectedGame = useMemo(
    () => savedGames.find((g) => g.id === selectedId) || null,
    [savedGames, selectedId]
  );

  const hasGames = savedGames.length > 0;

  const handleCreateNew = () => {
    navigate('/game/new');
  };

  const handleOpenPlay = () => {
    if (!selectedGame) return;
    navigate(`/play/${selectedGame.id}`);
  };

  const handleOpenEdit = () => {
    if (!selectedGame) return;
    navigate(`/edit/${selectedGame.id}`);
  };

  const handleDelete = () => {
    if (!selectedGame) return;
    const ok = confirm(`Delete "${selectedGame.title}"? This can't be undone.`);
    if (!ok) return;

    const next = savedGames.filter((g) => g.id !== selectedGame.id);
    setSavedGames(next);
    setSelectedId('');

    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  useEffect(() => {
      document.title = "Home | Open-Trivia";
    }, []);

  return (
    <>
      <main className="home">
        <section className="home-card">
          <Headline2 className="home-title">Open-Trivia</Headline2>
          <Subheading className="home-subtitle">
            Trivia Boards you can create, edit and play.
          </Subheading>

          <div className="home-actions">
            <div className="home-action">
              <Body1 className="home-action-text">
                Start from scratch and build a new board.
              </Body1>
              <Button
                label="Create New Board"
                size="normal"
                fontSize="subheading"
                onClick={handleCreateNew}
              />
            </div>

            <div className="home-divider" />

            <div className="home-action">
              <Body1 className="home-action-text">
                Pick an existing board to edit or play.
              </Body1>

              <div className="home-open">
                <label className="home-label" htmlFor="savedGame">
                  Saved boards
                </label>

                <select
                  id="savedBoard"
                  className="home-select"
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  disabled={!hasGames}
                >
                  <option value="">
                    {hasGames ? 'Select a board…' : 'No saved boards found'}
                  </option>
                  {savedGames
                    .slice()
                    .sort((a, b) => b.updatedAt - a.updatedAt)
                    .map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.title} • {formatDate(g.updatedAt)}
                      </option>
                    ))}
                </select>

                <div className="home-open-buttons">
                  <Button
                    label="Play"
                    size="medium"
                    fontSize="body"
                    disabled={!selectedGame}
                    onClick={handleOpenPlay}
                  />
                  <Button
                    label="Edit"
                    size="medium"
                    fontSize="body"
                    disabled={!selectedGame}
                    onClick={handleOpenEdit}
                  />
                  <Button
                    label="Delete"
                    size="medium"
                    fontSize="body"
                    disabled={!selectedGame}
                    onClick={handleDelete}
                  />
                </div>

                {selectedGame && (
                  <div className="home-meta">
                    <Body1>
                      <span className="home-meta-label">Selected:</span> {selectedGame.title}
                    </Body1>
                    <Body1>
                      <span className="home-meta-label">Last updated:</span>{' '}
                      {formatDate(selectedGame.updatedAt)}
                    </Body1>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default HomePage;