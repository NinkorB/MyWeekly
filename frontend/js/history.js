function historyComponent() {
    return {
        get sortedHistory() {
            return [...Alpine.store('main').user.history].sort((a, b) => new Date(b.weekOf) - new Date(a.weekOf));
        },
        get streak() {
            let currentStreak = 0;
            const sorted = this.sortedHistory;
            for (let i = 0; i < sorted.length; i++) {
                const logDate = new Date(sorted[i].weekOf);
                const expectedDate = Alpine.store('main').getStartOfWeek(new Date());
                expectedDate.setDate(expectedDate.getDate() - (i * 7));
                if (logDate.getTime() === expectedDate.getTime() && sorted[i].goalAchieved) {
                    currentStreak++;
                } else {
                    break;
                }
            }
            return currentStreak;
        }
    };
}
