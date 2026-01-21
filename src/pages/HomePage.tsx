import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import Footer from 'src/components/layout/Footer';

import CategoryPicker from 'src/components/ui/CategoryPicker';
import Modal from 'src/components/ui/Modal';

import Button from 'src/components/presets/Button';
import { Headline2, Subheading, Body1 } from 'src/components/presets/Typography';

import 'src/css/pages/HomePage.css';

import {
  type SavedGame,
  saveSavedGames,
  loadSavedGames,
  formatDate,
} from 'src/types/game';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [savedGames, setSavedGames] = useState<SavedGame[]>(() => loadSavedGames());
  const [selectedId, setSelectedId] = useState<string>('');

  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    setSavedGames(loadSavedGames());
  }, [location.key]);

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
    navigate(`/game/${selectedGame.id}/edit`);
  };

  const handleDelete = () => {
    if (!selectedGame) return;
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
  if (!selectedGame) return;

  const next = savedGames.filter((g) => g.id !== selectedGame.id);
    setSavedGames(next);
    setSelectedId('');

    saveSavedGames(next);
    setDeleteOpen(false);
  };

  const sortedGames = useMemo(
    () => savedGames.slice().sort((a, b) => b.updatedAt - a.updatedAt),
    [savedGames]
  );

  const selectedIndex = useMemo(() => {
    if (!selectedId) return -1;
    return sortedGames.findIndex((g) => g.id === selectedId);
  }, [sortedGames, selectedId]);

  useEffect(() => {
    document.title = 'Home | Open-Trivia';
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
                {hasGames ? (
                  <CategoryPicker
                    label=""
                    value={selectedIndex}
                    options={sortedGames.map((g, idx) => ({
                      value: idx,
                      label: `${g.title} • ${formatDate(g.updatedAt)}`,
                    }))}
                    onChange={(idx) => {
                      setSelectedId(sortedGames[idx]?.id ?? '');
                    }}
                  />
                ) : (
                  <div className="home-no-saves">
                    <Body1>No saved boards found</Body1>
                  </div>
                )}

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
                      <span className="home-meta-label">Selected:</span>{' '}
                      {selectedGame.title}
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

      <Modal
        open={deleteOpen}
        title={selectedGame ? `Delete "${selectedGame.title}"?` : 'Delete board?'}
        onClose={() => setDeleteOpen(false)}
        footer={
          <>
            <Button label="Cancel" size="medium" onClick={() => setDeleteOpen(false)} />
            <Button label="Delete" size="medium" onClick={confirmDelete} />
          </>
        }
      >
        <Body1>
          This will permanently remove the saved board from this browser. This can’t be undone.
        </Body1>
      </Modal>

      <Footer />
    </>
  );
};

export default HomePage;