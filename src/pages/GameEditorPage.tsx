import React, { useEffect, useMemo, useState } from 'react';
import 'src/css/pages/CreateGamePage.css';

import Button from 'src/components/presets/Button';
import { Headline2, Subheading, Body1 } from 'src/components/presets/Typography';

import Modal from 'src/components/ui/Modal';
import CategoryPicker from 'src/components/ui/CategoryPicker';
import Footer from 'src/components/layout/Footer';

import { useNavigate, useParams } from 'react-router-dom';
import useIsMobile from 'src/hooks/useIsMobile';

import {
  type GameDraft,
  type SavedGame,
  loadSavedGames,
  saveSavedGames,
  makeDraft,
  clampInt,
  makeId,
} from 'src/types/game';

type Mode = 'create' | 'edit';

interface GameEditorPageProps {
  mode: Mode;
}

const GameEditorPage: React.FC<GameEditorPageProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId: string }>();
  const isMobile = useIsMobile(768);

  const [loaded, setLoaded] = useState(mode === 'create');

  const [cols, setCols] = useState(6);
  const [rows, setRows] = useState(5);
  const [draft, setDraft] = useState<GameDraft>(() => makeDraft(6, 5));

  const [gameTitle, setGameTitle] = useState('Untitled Game');
  const [isDirty, setIsDirty] = useState(false);

  const [activeCategory, setActiveCategory] = useState(0);

  const [selected, setSelected] = useState<{ cIdx: number; rIdx: number } | null>(null);
  const [draftPrompt, setDraftPrompt] = useState('');
  const [draftAnswer, setDraftAnswer] = useState('');
  const [draftImage, setDraftImage] = useState<string | undefined>(undefined);

  // Load existing game when in edit mode
  useEffect(() => {
    if (mode !== 'edit') return;

    const games = loadSavedGames();
    const found = games.find((g) => g.id === gameId);

    if (!found) {
      navigate('/', { replace: true });
      return;
    }

    setGameTitle(found.title || 'Untitled Game');
    setDraft(found.draft);
    setCols(found.draft.categories.length || 6);
    setRows(found.draft.categories[0]?.cells.length || 5);

    setIsDirty(false);
    setLoaded(true);
  }, [mode, gameId, navigate]);

  // Keep activeCategory valid when cols changes
  useEffect(() => {
    setActiveCategory((prev) => Math.min(prev, Math.max(cols - 1, 0)));
  }, [cols]);

  // Resize grid while preserving content
  useEffect(() => {
    // Avoid running resize logic before edit-mode data loads (prevents overwriting loaded draft)
    if (!loaded) return;

    setDraft((prev) => {
      return {
        categories: Array.from({ length: cols }, (_, cIdx) => {
          const prevCat = prev.categories[cIdx];

          return {
            title: prevCat?.title ?? `Category ${cIdx + 1}`,
            cells: Array.from({ length: rows }, (_, rIdx) => {
              const prevCell = prevCat?.cells?.[rIdx];
              return {
                points: (rIdx + 1) * 100,
                prompt: prevCell?.prompt ?? '',
                answer: prevCell?.answer ?? '',
                imageDataUrl: prevCell?.imageDataUrl,
              };
            }),
          };
        }),
      };
    });
  }, [cols, rows, loaded]);

  // Warn on refresh/close if dirty
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const gridTemplate = useMemo(() => {
    return { gridTemplateColumns: `repeat(${draft.categories.length}, 1fr)` };
  }, [draft.categories.length]);

  const confirmLeaveIfDirty = (): boolean => {
    if (!isDirty) return true;
    return window.confirm('You have unsaved changes. Leave without saving?');
  };

  const handleBackHome = () => {
    if (!confirmLeaveIfDirty()) return;
    navigate('/');
  };

  const closeModal = () => setSelected(null);

  const saveModal = () => {
    if (!selected) return;

    setDraft((prev) => ({
      ...prev,
      categories: prev.categories.map((cat, cIdx) => {
        if (cIdx !== selected.cIdx) return cat;

        return {
          ...cat,
          cells: cat.cells.map((cell, rIdx) => {
            if (rIdx !== selected.rIdx) return cell;
            return {
              ...cell,
              prompt: draftPrompt,
              answer: draftAnswer,
              imageDataUrl: draftImage,
            };
          }),
        };
      }),
    }));

    setIsDirty(true);
    closeModal();
  };

  const onPickImage: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = () => setDraftImage(String(reader.result));
    reader.readAsDataURL(file);

    e.target.value = '';
  };

  const handleSave = () => {
    const safeTitle = gameTitle.trim() || 'Untitled Game';
    const games = loadSavedGames();

    if (mode === 'edit') {
      if (!gameId) return;

      const next = games.map((g) =>
        g.id === gameId ? { ...g, title: safeTitle, updatedAt: Date.now(), draft } : g
      );

      saveSavedGames(next);
      setIsDirty(false);
      navigate('/');
      return;
    }

    // create mode -> new entry
    const newItem: SavedGame = {
      id: makeId(),
      title: safeTitle,
      updatedAt: Date.now(),
      draft,
    };

    saveSavedGames([newItem, ...games]);
    setIsDirty(false);
    navigate('/');
  };

  if (!loaded) {
    return (
      <main className="cgp">
        <div className="cgp-topbar">
          <Button label="← Back to Home" size="medium" onClick={() => navigate('/')} />
        </div>
        <section className="cgp-header">
          <Headline2>Edit Game</Headline2>
          <Subheading>Loading…</Subheading>
        </section>
      </main>
    );
  }

  const pageTitle = mode === 'edit' ? 'Edit Game' : 'Create Game';
  const pageSubtitle =
    mode === 'edit'
      ? 'Update your board, then save your changes.'
      : 'Set your board size, then fill in each question.';

  return (
    <>
      <main className="cgp">
        <div className="cgp-topbar">
          <Button label="← Back to Home" size="medium" onClick={handleBackHome} />
        </div>

        <section className="cgp-header">
          <Headline2>{pageTitle}</Headline2>
          <Subheading>{pageSubtitle}</Subheading>
        </section>

        <section className="cgp-panel">
          <div className="cgp-controls">
            <div className="cgp-field">
              <Body1 className="cgp-label">Categories (columns)</Body1>
              <input
                className="cgp-input"
                type="number"
                min={1}
                max={12}
                value={cols}
                onChange={(e) => {
                  setCols(clampInt(Number(e.target.value || 1), 1, 12));
                  setIsDirty(true);
                }}
              />
            </div>

            <div className="cgp-field">
              <Body1 className="cgp-label">Questions per category (rows)</Body1>
              <input
                className="cgp-input"
                type="number"
                min={1}
                max={15}
                value={rows}
                onChange={(e) => {
                  setRows(clampInt(Number(e.target.value || 1), 1, 15));
                  setIsDirty(true);
                }}
              />
            </div>

            <div className="cgp-hint">
              <Body1>
                Points increase by row: <span className="cgp-mono">100, 200, 300…</span>
              </Body1>
            </div>
          </div>
        </section>

        <section className="cgp-board">
          {isMobile ? (
            <div className="cgp-mobile">
              <div className="cgp-mobile-picker">
                <CategoryPicker
                  value={activeCategory}
                  options={draft.categories.map((cat, idx) => ({
                    value: idx,
                    label: cat.title || `Category ${idx + 1}`,
                  }))}
                  onChange={setActiveCategory}
                />

                <input
                  className="cgp-input full"
                  value={draft.categories[activeCategory]?.title ?? ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setDraft((prev) => ({
                      ...prev,
                      categories: prev.categories.map((c, i) =>
                        i === activeCategory ? { ...c, title: value } : c
                      ),
                    }));
                    setIsDirty(true);
                  }}
                  placeholder="Category name…"
                />
              </div>

              <div className="cgp-mobile-list">
                {draft.categories[activeCategory]?.cells.map((cell, rIdx) => {
                  const isFilled =
                    cell.prompt.trim().length > 0 ||
                    !!cell.imageDataUrl ||
                    cell.answer.trim().length > 0;

                  return (
                    <button
                      key={rIdx}
                      className={`cgp-mobile-row ${isFilled ? 'filled' : ''}`}
                      type="button"
                      onClick={() => {
                        const cIdx = activeCategory;
                        setSelected({ cIdx, rIdx });
                        const current = draft.categories[cIdx].cells[rIdx];
                        setDraftPrompt(current.prompt);
                        setDraftAnswer(current.answer);
                        setDraftImage(current.imageDataUrl);
                      }}
                    >
                      <div className="cgp-mobile-points">{cell.points}</div>
                      <div className="cgp-mobile-meta">
                        <div className="cgp-mobile-status">{isFilled ? 'Edited' : 'Empty'}</div>
                        <div className="cgp-mobile-preview">
                          {cell.prompt.trim() ? cell.prompt.trim() : 'Tap to edit…'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="cgp-grid" style={gridTemplate}>
              {draft.categories.map((cat, cIdx) => (
                <div key={`head-${cIdx}`} className="cgp-cat">
                  <input
                    className="cgp-cat-input"
                    value={cat.title}
                    onChange={(e) => {
                      const value = e.target.value;
                      setDraft((prev) => ({
                        ...prev,
                        categories: prev.categories.map((c, i) =>
                          i === cIdx ? { ...c, title: value } : c
                        ),
                      }));
                      setIsDirty(true);
                    }}
                  />
                </div>
              ))}

              {Array.from({ length: rows }).map((_, rIdx) =>
                draft.categories.map((cat, cIdx) => {
                  const cell = cat.cells[rIdx];
                  if (!cell) return null;

                  const isFilled =
                    cell.prompt.trim().length > 0 ||
                    !!cell.imageDataUrl ||
                    cell.answer.trim().length > 0;

                  return (
                    <button
                      key={`cell-${rIdx}-${cIdx}`}
                      className={`cgp-cell ${isFilled ? 'filled' : ''}`}
                      onClick={() => {
                        setSelected({ cIdx, rIdx });
                        const current = draft.categories[cIdx].cells[rIdx];
                        setDraftPrompt(current.prompt);
                        setDraftAnswer(current.answer);
                        setDraftImage(current.imageDataUrl);
                      }}
                      type="button"
                    >
                      <div className="cgp-points">{cell.points}</div>
                      <div className="cgp-cell-sub">{isFilled ? 'Edited' : 'Empty'}</div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </section>

        <section className="cgp-save">
          <div className="cgp-save-inner">
            <div className="cgp-save-left">
              <Body1 className="cgp-label">Game title</Body1>
              <input
                className="cgp-input full"
                value={gameTitle}
                onChange={(e) => {
                  setGameTitle(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="Untitled Game"
              />
            </div>

            <div className="cgp-save-right">
              {isDirty && <span className="cgp-unsaved">Unsaved changes</span>}
              <Button
                label={isDirty ? (mode === 'edit' ? 'Save Changes' : 'Save Game') : 'Saved'}
                size="medium"
                onClick={handleSave}
                disabled={!isDirty}
              />
            </div>
          </div>
        </section>

        <Modal
          open={!!selected}
          title={
            selected
              ? `${draft.categories[selected.cIdx].title} • ${
                  draft.categories[selected.cIdx].cells[selected.rIdx].points
                } points`
              : undefined
          }
          onClose={closeModal}
          footer={
            <>
              <Button label="Cancel" size="medium" onClick={closeModal} />
              <Button label="Save" size="medium" onClick={saveModal} />
            </>
          }
        >
          <div className="cgp-modal-field">
            <Body1 className="cgp-label">Question / Description</Body1>
            <textarea
              className="cgp-textarea"
              value={draftPrompt}
              onChange={(e) => setDraftPrompt(e.target.value)}
              placeholder="Type the question or description here… (links can just be pasted as text)"
              rows={6}
            />
          </div>

          <div className="cgp-modal-field">
            <Body1 className="cgp-label">Answer</Body1>
            <input
              className="cgp-input full"
              value={draftAnswer}
              onChange={(e) => setDraftAnswer(e.target.value)}
              placeholder="Type the correct answer…"
            />
          </div>

          <div className="cgp-modal-field">
            <Body1 className="cgp-label">Image (optional)</Body1>
            <input type="file" accept="image/*" onChange={onPickImage} />
            {draftImage && (
              <div className="cgp-preview">
                <img className="cgp-preview-img" src={draftImage} alt="" />
                <Button label="Remove Image" size="small" onClick={() => setDraftImage(undefined)} />
              </div>
            )}
          </div>
        </Modal>
      </main>

      <Footer />
    </>
  );
};

export default GameEditorPage