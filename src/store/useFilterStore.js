import { create } from 'zustand';

// Read persisted filters from localStorage
const loadPersistedFilters = () => {
    try {
        const stored = localStorage.getItem('petanque_filters');
        if (stored) return JSON.parse(stored);
    } catch (e) { /* ignore */ }
    return null;
};

const persistedState = loadPersistedFilters();

const useFilterStore = create((set, get) => ({
    // Default State (restored from localStorage if available)
    discipline: persistedState?.discipline || 'all',
    departements: persistedState?.departements || {
        '31': true,
        '09': true,
    },
    isFilterOpen: false,

    // Actions
    setDiscipline: (discipline) => {
        set({ discipline });
        persistFilters(get());
    },
    toggleDepartement: (dept) => {
        set((state) => ({
            departements: {
                ...state.departements,
                [dept]: !state.departements[dept]
            }
        }));
        // Need to call persist after state update
        setTimeout(() => persistFilters(get()), 0);
    },
    openFilters: () => set({ isFilterOpen: true }),
    closeFilters: () => set({ isFilterOpen: false }),
    resetFilters: () => {
        set({
            discipline: 'all',
            departements: { '31': true, '09': true }
        });
        setTimeout(() => persistFilters(get()), 0);
    },

    // Initialize filters based on user department
    initFromUser: (userDept) => {
        // Only init if no persisted state exists
        if (!persistedState) {
            const departements = { '31': false, '09': false };
            if (userDept && departements.hasOwnProperty(userDept)) {
                departements[userDept] = true;
            } else {
                // Default: both enabled
                departements['31'] = true;
                departements['09'] = true;
            }
            set({ departements });
            setTimeout(() => persistFilters(get()), 0);
        }
    }
}));

// Helper to persist to localStorage
function persistFilters(state) {
    try {
        localStorage.setItem('petanque_filters', JSON.stringify({
            discipline: state.discipline,
            departements: state.departements
        }));
    } catch (e) { /* ignore */ }
}

export default useFilterStore;
