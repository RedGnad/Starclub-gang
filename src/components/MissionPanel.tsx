import React from "react";
import type { AnyMission } from "../types/missions";

interface MissionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onDailyCheckin: () => void;
  onClaimRewards: (cubes: number) => void;
  // Données des missions passées depuis le parent
  missions: AnyMission[];
  completed: boolean;
  streak: number;
  availableRewards: number;
  onClaimMissionRewards: () => void;
}

const DailyCheckinItem: React.FC<{
  mission: AnyMission;
  onCheckin: () => void;
}> = ({ mission, onCheckin }) => {
  const progressPercentage = Math.min(
    (mission.current / mission.target) * 100,
    100
  );

  return (
    <div
      style={{
        margin: "8px 20px",
        padding: "16px",
        backgroundColor: "#0D001D",
        border: mission.completed ? "2px solid #b3f100" : "2px solid #ae67c7",
        borderRadius: "12px",
        boxShadow: mission.completed
          ? "0 4px 20px rgba(179, 241, 0, 0.3)"
          : "0 2px 10px rgba(174, 103, 199, 0.2)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ flex: 1 }}>
          <h4
            style={{
              margin: 0,
              fontSize: "14px",
              color: mission.completed ? "#b3f100" : "#ffffff",
              fontWeight: "bold",
            }}
          >
            {mission.title}
          </h4>
          <p
            style={{
              margin: "4px 0 8px 0",
              fontSize: "12px",
              color: "#ae67c7",
            }}
          >
            {mission.description}
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                color: mission.completed ? "#b3f100" : "#ae67c7",
                fontWeight: "bold",
              }}
            >
              {mission.current}/{mission.target}
            </span>
            {!mission.completed ? (
              <button
                onClick={onCheckin}
                style={{
                  background: "#f19300",
                  border: "2px solid #b3f100",
                  borderRadius: "8px",
                  color: "#0D001D",
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Check In
              </button>
            ) : (
              <span
                style={{
                  background: "#b3f100",
                  border: "2px solid #b3f100",
                  borderRadius: "8px",
                  color: "#0D001D",
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                ✓ Completed
              </span>
            )}
          </div>
        </div>
      </div>
      {/* Progress bar */}
      <div
        style={{
          marginTop: "8px",
          height: "4px",
          backgroundColor: "#ae67c7",
          borderRadius: "2px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progressPercentage}%`,
            backgroundColor: mission.completed ? "#b3f100" : "#f19300",
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
};

const MissionItem: React.FC<{ mission: AnyMission }> = ({ mission }) => {
  const progressPercentage = Math.min(
    (mission.current / mission.target) * 100,
    100
  );

  return (
    <div
      style={{
        margin: "8px 20px",
        padding: "16px",
        backgroundColor: "#0D001D",
        border: mission.completed ? "2px solid #b3f100" : "2px solid #ae67c7",
        borderRadius: "12px",
        boxShadow: mission.completed
          ? "0 4px 20px rgba(179, 241, 0, 0.3)"
          : "0 2px 10px rgba(174, 103, 199, 0.2)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ flex: 1 }}>
          <h4
            style={{
              margin: 0,
              fontSize: "14px",
              color: mission.completed ? "#b3f100" : "#ffffff",
              fontWeight: "bold",
            }}
          >
            {mission.title}
          </h4>
          <p
            style={{
              margin: "4px 0 8px 0",
              fontSize: "12px",
              color: "#ae67c7",
            }}
          >
            {mission.description}
          </p>
          <span
            style={{
              fontSize: "12px",
              color: mission.completed ? "#b3f100" : "#ae67c7",
              fontWeight: "bold",
            }}
          >
            {mission.current}/{mission.target}
          </span>
        </div>
        {mission.completed && (
          <div
            style={{
              background: "#b3f100",
              borderRadius: "50%",
              width: "24px",
              height: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ color: "#0D001D", fontSize: "14px" }}>✓</span>
          </div>
        )}
      </div>
      {/* Progress bar */}
      <div
        style={{
          marginTop: "8px",
          height: "4px",
          backgroundColor: "#ae67c7",
          borderRadius: "2px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progressPercentage}%`,
            backgroundColor: mission.completed ? "#b3f100" : "#f19300",
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
};

export const MissionPanel: React.FC<MissionPanelProps> = ({
  isOpen,
  onClose,
  onDailyCheckin,
  onClaimRewards,
  missions,
  completed,
  streak,
  availableRewards,
  onClaimMissionRewards,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          width: "90%",
          maxWidth: "600px",
          maxHeight: "80vh",
          backgroundColor: "#1a1a2e",
          borderRadius: "20px",
          border: "3px solid #ae67c7",
          boxShadow: "0 8px 32px rgba(174, 103, 199, 0.3)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px",
            borderBottom: "2px solid #ae67c7",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "20px",
                color: "#b3f100",
                fontWeight: "bold",
              }}
            >
              Daily Missions
            </h2>
            <p
              style={{
                margin: "4px 0 0 0",
                fontSize: "14px",
                color: "#ae67c7",
              }}
            >
              Streak: {streak} day{streak !== 1 ? "s" : ""} •{" "}
              {missions.filter((m) => m.completed).length}/{missions.length}{" "}
              completed
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "2px solid #ae67c7",
              borderRadius: "10px",
              color: "#ae67c7",
              padding: "8px 16px",
              fontSize: "14px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Close
          </button>
        </div>

        {/* Missions List */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "12px 0",
          }}
        >
          {missions.map((mission) => {
            // Composant spécial pour Daily Check-in avec bouton
            if (
              (mission as any).type === "daily_checkin" &&
              (mission as any).title === "Daily Check-in"
            ) {
              return (
                <DailyCheckinItem
                  key={mission.id}
                  mission={mission}
                  onCheckin={onDailyCheckin}
                />
              );
            }
            // Composant normal pour les autres missions
            return <MissionItem key={mission.id} mission={mission} />;
          })}
        </div>

        {/* Claim Rewards Section */}
        {availableRewards > 0 && (
          <div
            style={{
              margin: "16px 20px",
              padding: "16px",
              backgroundColor: "#0D001D",
              border: "2px solid #b3f100",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(179, 241, 0, 0.3)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    color: "#b3f100",
                    fontWeight: "bold",
                  }}
                >
                  Rewards Available
                </p>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    fontSize: "12px",
                    color: "#ae67c7",
                  }}
                >
                  {availableRewards} cube{availableRewards > 1 ? "s" : ""} to
                  claim
                </p>
              </div>
              <button
                onClick={onClaimMissionRewards}
                style={{
                  background: "#f19300",
                  border: "2px solid #b3f100",
                  borderRadius: "10px",
                  color: "#0D001D",
                  padding: "10px 20px",
                  fontSize: "13px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#ff9f1a";
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#f19300";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                Claim Rewards
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            margin: "16px 20px 20px 20px",
            paddingTop: "16px",
            borderTop: "1px solid #ae67c7",
            fontSize: "11px",
            color: "#ae67c7",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              color: "#ffffff",
              marginBottom: "4px",
            }}
          >
            Complete daily missions to earn cubes
          </div>
          <div style={{ fontSize: "10px", color: "#ae67c7" }}>
            Progress resets at midnight UTC
          </div>
        </div>
      </div>
    </div>
  );
};
