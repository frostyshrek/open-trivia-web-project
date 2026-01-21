import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import 'src/css/pages/PlayGamePage.css';

import Button from 'src/components/presets/Button';
import { Headline2, Subheading, Body1 } from 'src/components/presets/Typography';
import Modal from 'src/components/ui/Modal';

import { loadSavedGames, type GameDraft } from 'src/types/game';

import CategoryPicker from 'src/components/ui/CategoryPicker';
import useIsMobile from 'src/hooks/useIsMobile';

type Team = {
  id: string;
  name: string;
  score: number;
};

type CellKey = `${number}:${number}`;

const clampInt = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, Math.floor(value)));

const makeTeamId = (i: number) => `team-${i + 1}`;

const PlayGamePage: React.FC = () => {
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId: string }>();

  const [loaded, setLoaded] = useState(false);
  const [title, setTitle] = useState('Play Game');
  const [draft, setDraft] = useState<GameDraft | null>(null);

  // Team setup
  const [setupOpen, setSetupOpen] = useState(true);
  const [teamCount, setTeamCount] = useState(2);
  const [teamNames, setTeamNames] = useState<string[]>(['Team 1', 'Team 2', 'Team 3', 'Team 4']);

  // Game state
  const [teams, setTeams] = useState<Team[]>([]);
  const [turnIndex, setTurnIndex] = useState(0);

  const [used, setUsed] = useState<Set<CellKey>>(() => new Set());
  const [selectedCell, setSelectedCell] = useState<{ cIdx: number; rIdx: number } | null>(null);

  const [turnPulse, setTurnPulse] = useState(0);

  // Step 3 state
  const [revealed, setRevealed] = useState(false);

  const cellKey = (cIdx: number, rIdx: number): CellKey => `${cIdx}:${rIdx}`;

  const isMobile = useIsMobile(768);
  const [activeCategory, setActiveCategory] = useState(0);

  useEffect(() => {
    if (!draft) return;
    setActiveCategory((prev) => Math.min(prev, Math.max(draft.categories.length - 1, 0)));
  }, [draft]);

  const gridTemplate = useMemo(() => {
    return { gridTemplateColumns: `repeat(${draft?.categories.length ?? 0}, 1fr)` };
  }, [draft]);

  const rowsCount = useMemo(() => {
    return draft?.categories[0]?.cells.length ?? 0;
  }, [draft]);

  const totalCells = useMemo(() => {
    return (draft?.categories.length ?? 0) * rowsCount;
  }, [draft, rowsCount]);

  const gameOver = useMemo(() => {
    return !setupOpen && totalCells > 0 && used.size >= totalCells;
  }, [setupOpen, totalCells, used]);

  const leaderboard = useMemo(() => {
    return teams.slice().sort((a, b) => b.score - a.score);
  }, [teams]);

  const topScore = useMemo(() => {
    return leaderboard[0]?.score ?? 0;
  }, [leaderboard]);

  const winners = useMemo(() => {
    if (leaderboard.length === 0) return [];
    return leaderboard.filter((t) => t.score === topScore);
  }, [leaderboard, topScore]);

  useEffect(() => {
    if (!gameOver) return;
    setSelectedCell(null);
    setRevealed(false);
  }, [gameOver]);

  useEffect(() => {
    if (setupOpen) return;
    setTurnPulse((p) => p + 1);
  }, [turnIndex, setupOpen]);

  // Load saved game
  useEffect(() => {
    const games = loadSavedGames();
    const found = games.find((g) => g.id === gameId);

    if (!found) {
      navigate('/', { replace: true });
      return;
    }

    setTitle(found.title || 'Play Game');
    setDraft(found.draft);
    setLoaded(true);
    setSetupOpen(true);
  }, [gameId, navigate]);

  useEffect(() => {
    document.title = `${title} | Play`;
  }, [title]);

  const canStart = useMemo(() => {
    const names = teamNames.slice(0, teamCount).map((n) => n.trim());
    return names.every((n) => n.length > 0);
  }, [teamCount, teamNames]);

  const startGame = () => {
    if (!draft) return;

    const pickedNames = teamNames.slice(0, teamCount).map((n, i) => n.trim() || `Team ${i + 1}`);
    const newTeams: Team[] = pickedNames.map((name, i) => ({
      id: makeTeamId(i),
      name,
      score: 0,
    }));

    const randomStart = Math.floor(Math.random() * newTeams.length);

    setTeams(newTeams);
    setTurnIndex(randomStart);
    setUsed(new Set());
    setSelectedCell(null);
    setRevealed(false);
    setSetupOpen(false);
  };

  const rematch = () => {
    // keep team names, reset scores, clear used, random start
    setTeams((prev) => prev.map((t) => ({ ...t, score: 0 })));
    setUsed(new Set());
    setSelectedCell(null);
    setRevealed(false);

    const randomStart = Math.floor(Math.random() * Math.max(teams.length, 1));
    setTurnIndex(randomStart);
  };

  const newTeams = () => {
    // go back to setup modal
    setTeams([]);
    setUsed(new Set());
    setSelectedCell(null);
    setRevealed(false);
    setSetupOpen(true);
  };

  const onBackHome = () => navigate('/');

  const nextTurnIndex = (current: number, count: number) => {
    if (count <= 0) return 0;
    return (current + 1) % count;
  };

  const finalizeQuestion = (
    result: { type: 'team'; teamIndex: number } | { type: 'none' }
  ) => {
    if (!selectedCell || !draft) return;

    const { cIdx, rIdx } = selectedCell;
    const points = draft.categories[cIdx].cells[rIdx].points;

    // mark used
    const k = cellKey(cIdx, rIdx);
    setUsed((prev) => {
      const next = new Set(prev);
      next.add(k);
      return next;
    });

    if (result.type === 'team') {
      // award points + set that team as current turn
      setTeams((prev) =>
        prev.map((t, idx) =>
          idx === result.teamIndex ? { ...t, score: t.score + points } : t
        )
      );
      setTurnIndex(result.teamIndex);
    } else {
      // nobody -> next team in cycle
      setTurnIndex((prev) => nextTurnIndex(prev, teams.length));
    }

    setSelectedCell(null);
    setRevealed(false);
  };

  if (!loaded || !draft) {
    return (
      <main className="pgp">
        <div className="pgp-top">
          <Button label="← Back to Home" size="medium" onClick={onBackHome} />
        </div>
        <section className="pgp-header">
          <Headline2>Play</Headline2>
          <Subheading>Loading…</Subheading>
        </section>
      </main>
    );
  }

  return (
    <main className="pgp">
      <div className="pgp-top">
        <Button label="← Back to Home" size="medium" onClick={onBackHome} />
      </div>

      <section className="pgp-header">
        <Headline2>{title}</Headline2>
        <Subheading>
          {setupOpen ? 'Set up teams to begin.' : `Turn: ${teams[turnIndex]?.name ?? '—'}`}
        </Subheading>
      </section>

      {!setupOpen && (
        <>
          <section className="pgp-scoreboard">
            {teams.map((t, idx) => (
              <div
                className={`pgp-team ${idx === turnIndex ? 'active pulse' : ''}`}
                key={`${t.id}-${turnPulse}`}
              >
                <div className="pgp-team-name">{t.name}</div>
                <div className="pgp-team-score">{t.score}</div>
              </div>
            ))}
          </section>

          <section className="pgp-board">
            {isMobile ? (
              <div className="pgp-mobile">
                <div className="pgp-mobile-picker">
                  <CategoryPicker
                    value={activeCategory}
                    options={draft.categories.map((cat, idx) => ({
                      value: idx,
                      label: cat.title || `Category ${idx + 1}`,
                    }))}
                    onChange={setActiveCategory}
                  />
                </div>

                <div className="pgp-mobile-list">
                  {draft.categories[activeCategory]?.cells.map((cell, rIdx) => {
                    const k = cellKey(activeCategory, rIdx);
                    const isUsed = used.has(k);

                    return (
                      <button
                        key={k}
                        type="button"
                        className={`pgp-mobile-row ${isUsed ? 'used' : ''}`}
                        disabled={isUsed}
                        onClick={() => {
                          setSelectedCell({ cIdx: activeCategory, rIdx });
                          setRevealed(false);
                        }}
                      >
                        <div className="pgp-mobile-points">{cell.points}</div>
                        <div className="pgp-mobile-meta">
                          <div className="pgp-mobile-preview">
                            {isUsed ? 'Answered' : 'Tap to open'}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="pgp-grid" style={gridTemplate}>
                {draft.categories.map((cat, cIdx) => (
                  <div key={`head-${cIdx}`} className="pgp-cat">
                    {cat.title || `Category ${cIdx + 1}`}
                  </div>
                ))}

                {Array.from({ length: rowsCount }).map((_, rIdx) =>
                  draft.categories.map((cat, cIdx) => {
                    const cell = cat.cells[rIdx];
                    const k = cellKey(cIdx, rIdx);
                    const isUsed = used.has(k);

                    return (
                      <button
                        key={`cell-${rIdx}-${cIdx}`}
                        type="button"
                        className={`pgp-cell ${isUsed ? 'used' : ''}`}
                        disabled={isUsed}
                        onClick={() => {
                          setSelectedCell({ cIdx, rIdx });
                          setRevealed(false);
                        }}
                      >
                        {cell.points}
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </section>
        </>
      )}

      {/* Team Setup Modal */}
      <Modal
        open={setupOpen}
        title="Team setup"
        onClose={() => navigate('/')}
        footer={
          <>
            <Button label="Cancel" size="medium" onClick={() => navigate('/')} />
            <Button label="Start game" size="medium" onClick={startGame} disabled={!canStart} />
          </>
        }
      >
        <div className="pgp-setup">
          <div className="pgp-field">
            <Body1 className="pgp-label">Number of teams</Body1>
            <input
              className="pgp-input"
              type="number"
              min={1}
              max={4}
              value={teamCount}
              onChange={(e) => setTeamCount(clampInt(Number(e.target.value || 1), 1, 4))}
            />
          </div>

          <div className="pgp-teamlist">
            {Array.from({ length: teamCount }).map((_, idx) => (
              <div key={idx} className="pgp-field">
                <Body1 className="pgp-label">{`Team ${idx + 1} name`}</Body1>
                <input
                  className="pgp-input full"
                  value={teamNames[idx] ?? ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setTeamNames((prev) => {
                      const next = [...prev];
                      next[idx] = value;
                      return next;
                    });
                  }}
                  placeholder={`Team ${idx + 1}`}
                />
              </div>
            ))}
          </div>

          <div className="pgp-hint">
            <Body1>First turn will be chosen randomly when you press Start game.</Body1>
          </div>
        </div>
      </Modal>

      {/* Question Modal (Step 3) */}
      <Modal
        open={!!selectedCell && !setupOpen}
        title={
          selectedCell
            ? `${draft.categories[selectedCell.cIdx].title} • ${
                draft.categories[selectedCell.cIdx].cells[selectedCell.rIdx].points
              } points`
            : undefined
        }
        onClose={() => {
          setSelectedCell(null);
          setRevealed(false);
        }}
        footer={
          <>
            <Button
              label="Close"
              size="medium"
              onClick={() => {
                setSelectedCell(null);
                setRevealed(false);
              }}
            />

            {!revealed ? (
              <Button label="Reveal Answer" size="medium" onClick={() => setRevealed(true)} />
            ) : (
              <Button
                label="No one got it"
                size="medium"
                onClick={() => finalizeQuestion({ type: 'none' })}
              />
            )}
          </>
        }
        className="pgp-question-modal"
      >
        {selectedCell && (
          <div className="pgp-q">
            <Body1 className="pgp-q-label">Question</Body1>
            <div className="pgp-q-card">
              <Body1>
                {draft.categories[selectedCell.cIdx].cells[selectedCell.rIdx].prompt.trim() ||
                  'No prompt set for this question.'}
              </Body1>
            </div>

            {!revealed ? (
              <Body1 className="pgp-q-hint">
                Tap Reveal Answer when ready.
              </Body1>
            ) : (
              <>
                <Body1 className="pgp-q-label">Answer</Body1>
                <div className="pgp-q-card">
                  <Body1>
                    {draft.categories[selectedCell.cIdx].cells[selectedCell.rIdx].answer.trim() ||
                      'No answer set for this question.'}
                  </Body1>
                </div>

                <Body1 className="pgp-q-hint">Who got it correct?</Body1>

                <div className="pgp-award">
                  {teams.map((t, idx) => (
                    <Button
                      key={t.id}
                      label={t.name}
                      size="medium"
                      onClick={() => finalizeQuestion({ type: 'team', teamIndex: idx })}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
      <Modal
        open={gameOver}
        title="Game Over"
        onClose={() => navigate('/')}
        footer={
          <>
            <Button label="Back to Home" size="medium" onClick={() => navigate('/')} />
            <Button label="New Teams" size="medium" onClick={newTeams} />
            <Button label="Rematch" size="medium" onClick={rematch} />
          </>
        }
      >
        <div className="pgp-results">
          <Body1 className="pgp-results-title">
            {winners.length > 1
              ? `Tie! Winners: ${winners.map((w) => w.name).join(', ')}`
              : `Winner: ${winners[0]?.name ?? '—'}`}
          </Body1>

          <div className="pgp-results-list">
            {leaderboard.map((t, idx) => (
              <div key={t.id} className="pgp-results-row">
                <div className="pgp-results-rank">#{idx + 1}</div>
                <div className="pgp-results-name">{t.name}</div>
                <div className="pgp-results-score">{t.score}</div>
              </div>
            ))}
          </div>

          <Body1 className="pgp-results-hint">
            All questions have been answered.
          </Body1>
        </div>
        {winners.length > 0 && (
          <div className="pgp-confetti" aria-hidden="true">
            {Array.from({ length: 40 }).map((_, i) => (
              <span
                key={i}
                className="pgp-confetti-piece"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 1.5}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        )}
      </Modal>
    </main>
  );
};

export default PlayGamePage;
