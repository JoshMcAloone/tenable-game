import React from 'react';
import { Team } from '../types/domain';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  team: Team;
  active: boolean;
}

export default function TeamPanel({ team, active }: Props) {
  const { t } = useLanguage();
  
  return (
    <div className={`team-panel ${team.eliminated ? 'team-panel--eliminated' : (active ? 'team-panel--active' : 'team-panel--inactive')}`}>
      {/* Active Team Neon Indicator */}
      {active && (
        <div className="team-panel__active-indicator" />
      )}
      
      <div className="team-panel__content">
        {/* Team Name */}
        <div className="team-panel__header">
          <span className="team-panel__name">{team.name}</span>
          {active && (
            <div className="team-panel__badge">{t('team.active')}</div>
          )}
        </div>

        {/* Score and Lives */}
        <div className="team-panel__stats">
          <div className="team-panel__stat">
            <div className="team-panel__stat-value">{team.score}</div>
            <div className="team-panel__stat-label">{t('team.score')}</div>
          </div>
          <div className="team-panel__stat">
            <div className="team-panel__heart-container">
              {Array.from({ length: 3 }, (_, i) => (
                <span 
                  key={i} 
                  className={`team-panel__heart ${i < team.livesRemaining ? 'team-panel__heart--active' : 'team-panel__heart--inactive'}`}
                >
                  ❤
                </span>
              ))}
            </div>
            <div className="team-panel__stat-label">{t('team.lives')}</div>
          </div>
        </div>

        {/* Elimination Status */}
        {team.eliminated && (
          <div className="team-panel__eliminated">
            <div className="team-panel__eliminated-text">{t('team.eliminated')}</div>
          </div>
        )}
      </div>
    </div>
  );
}