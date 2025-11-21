import type { DailyMissionsState, AnyMission } from '../types/missions';

const STORAGE_KEY = 'sherlock_daily_missions';

// Missions par défaut pour chaque jour
const generateDefaultMissions = (date: string): AnyMission[] => [
  {
    id: `daily_checkin_${date}`,
    type: 'key_combo',
    title: 'Daily Check-in',
    description: 'Connect and open the application',
    target: 1,
    current: 0,
    completed: false,
    requiredCombos: [['app_opened']], // Special event
    completedCombos: [],
  },
  {
    id: `discovery_arcade_${date}`,
    type: 'key_combo',
    title: 'turn on Discovery Arcade',
    description: 'Open the Discovery modal to explore dApps',
    target: 1,
    current: 0,
    completed: false,
    requiredCombos: [['discovery_modal_opened']], // Special event
    completedCombos: [],
  },
  {
    id: `cube_activations_${date}`,
    type: 'key_combo',
    title: 'Cube Activator',
    description: 'Open 3 cube mission modals',
    target: 3,
    current: 0,
    completed: false,
    requiredCombos: [['cube_modal_opened']], // Special event
    completedCombos: [],
  },
  {
    id: `cube_completions_${date}`,
    type: 'key_combo',
    title: 'Cube Master',
    description: 'Complete 1 cube mission (earn 1 cube)',
    target: 1,
    current: 0,
    completed: false,
    requiredCombos: [['cube_completed']], // Special event for completed cube
    completedCombos: [],
  },
];

export class MissionStorage {
  private static getTodayDate(): string {
    return new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
  }

  static load(): DailyMissionsState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return this.createNewDay();
      }

      const state: DailyMissionsState = JSON.parse(stored);
      const today = this.getTodayDate();

      // Si c'est un nouveau jour, créer de nouvelles missions
      if (state.currentDate !== today) {
        return this.createNewDay(state);
      }

      return state;
    } catch (error) {
      console.warn('Error loading mission state:', error);
      return this.createNewDay();
    }
  }

  static save(state: DailyMissionsState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Error saving mission state:', error);
    }
  }

  private static createNewDay(previousState?: DailyMissionsState): DailyMissionsState {
    const today = this.getTodayDate();
    let newStreak = 1;

    // Calculer le streak
    if (previousState?.lastCompletedDate) {
      const lastDate = new Date(previousState.lastCompletedDate);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Si l'utilisateur a complété hier, continuer le streak
      if (lastDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
        newStreak = previousState.streak + 1;
      }
    }

    return {
      currentDate: today,
      missions: generateDefaultMissions(today),
      completed: false,
      streak: newStreak,
      lastCompletedDate: previousState?.completed ? previousState.currentDate : undefined,
    };
  }

  static updateMissionProgress(missionId: string, updateFn: (mission: AnyMission) => AnyMission): DailyMissionsState {
    const state = this.load();
    const missionIndex = state.missions.findIndex(m => m.id === missionId);
    
    if (missionIndex === -1) {
      console.warn(`❌ Mission ${missionId} not found`);
      return state;
    }

    const updatedMission = updateFn(state.missions[missionIndex]);
    state.missions[missionIndex] = updatedMission;

    // Vérifier si toutes les missions sont complétées RÉELLEMENT
    const allCompleted = state.missions.every(m => m.completed);
    console.log(`🎯 Mission progress check - All completed: ${allCompleted}`, {
      missions: state.missions.map(m => ({ id: m.id, completed: m.completed, current: m.current, target: m.target }))
    });
    
    state.completed = allCompleted;
    if (allCompleted && !state.lastCompletedDate) {
      state.lastCompletedDate = state.currentDate;
      console.log("🎉 All daily missions completed for the first time today!");
    }

    this.save(state);
    return state;
  }

  static getMissionProgress(): { completed: number; total: number; allCompleted: boolean } {
    const state = this.load();
    const completed = state.missions.filter(m => m.completed).length;
    const total = state.missions.length;
    return {
      completed,
      total,
      allCompleted: state.completed,
    };
  }

  // Méthode pour reset les missions (debug)
  static resetMissions() {
    console.log("🔄 Resetting all daily missions...");
    localStorage.removeItem(STORAGE_KEY);
    return this.load(); // Rechargera les missions par défaut
  }

  // Méthode pour debug l'état actuel
  static debugState() {
    const state = this.load();
    console.log("📊 Current missions state:", {
      date: state.currentDate,
      completed: state.completed,
      streak: state.streak,
      missions: state.missions.map(m => ({
        id: m.id,
        title: m.title,
        current: m.current,
        target: m.target,
        completed: m.completed
      }))
    });
    return state;
  }
}
