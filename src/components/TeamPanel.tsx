import React from 'react';
import { Team } from '../types/domain';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  team: Team;
  active: boolean;
  isAnimating?: boolean;
}

export default function TeamPanel({ team, active, isAnimating = false }: Props) {
  const { t } = useLanguage();
  
  // Determine if team is in critical state (1 life remaining) AND heartbeat should be active
  const isCritical = team.livesRemaining === 1 && !team.eliminated && !isAnimating;
  
  // Build CSS classes for team panel
  const panelClasses = [
    'team-panel',
    team.eliminated ? 'team-panel--eliminated' : (active ? 'team-panel--active' : 'team-panel--inactive'),
    isCritical ? 'team-panel--critical' : ''
  ].filter(Boolean).join(' ');
  
  return (
    <div className={panelClasses}>
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
            {/* Show integrated heart-ECG waveform for critical state (1 life) OR normal hearts */}
            {team.livesRemaining === 1 && !team.eliminated ? (
              <div className="team-panel__ecg-waveform">
                <div className="team-panel__ecg-baseline"></div>
                <div className="team-panel__ecg-trail"></div>
                <span className="team-panel__ecg-heart">
                  ❤
                </span>
              </div>
            ) : (
              <div className="team-panel__heart-container">
                {Array.from({ length: 3 }, (_, i) => {
                  const isActive = i < team.livesRemaining;
                  const shouldHeartbeat = team.livesRemaining > 1 && isActive;
                  
                  return (
                    <span 
                      key={i} 
                      className={`team-panel__heart ${
                        isActive 
                          ? `team-panel__heart--active ${shouldHeartbeat ? 'team-panel__heart--heartbeat' : ''}` 
                          : 'team-panel__heart--inactive'
                      }`}
                    >
                      ❤
                    </span>
                  );
                })}
              </div>
            )}
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