function dsaSheetComponent() {
    return {
        dsaSheetData: { topics: [], questions: [] },
        activeDsaTopic: null,
        dsaForm: { title: '', link: '', primaryTag: '', tags: '' },
        showReorderModal: false,
        sortableInstance: null,

        init() {
            // Load data when the component is initialized (i.e., when the page is shown)
            this.getDsaSheetData();
        },

        get filteredQuestions() {
            if (!this.activeDsaTopic) return [];
            return this.dsaSheetData.questions.filter(q => q.primaryTag === this.activeDsaTopic);
        },

        get progressByTopic() {
            const progress = {};
            if (!this.dsaSheetData.topics) return progress;
            this.dsaSheetData.topics.forEach(topic => {
                const questionsInTopic = this.dsaSheetData.questions.filter(q => q.primaryTag === topic.name);
                const total = questionsInTopic.length;
                const solved = questionsInTopic.filter(q => Alpine.store('main').auth.solvedDSA.includes(q._id)).length;
                progress[topic.name] = { solved, total, percentage: total > 0 ? Math.round((solved / total) * 100) : 0 };
            });
            return progress;
        },

        async getDsaSheetData() {
            try {
                const data = await Alpine.store('main').apiCall('/api/dsa/sheet-data');
                this.dsaSheetData = data;
                if (!this.activeDsaTopic && data.topics.length > 0) {
                    this.activeDsaTopic = data.topics[0].name;
                }
            } catch (error) {
                console.error("Failed to get DSA sheet data:", error);
            }
        },

        async addDsaQuestion() {
            try {
                if (!this.dsaForm.primaryTag) {
                    alert('Please provide a topic for the question.');
                    return;
                }
                await Alpine.store('main').apiCall('/api/dsa', 'POST', this.dsaForm);
                this.dsaForm = { title: '', link: '', primaryTag: '', tags: '' };
                this.getDsaSheetData();
            } catch (error) {
                alert('Failed to add question. The link might already exist.');
            }
        },

        async deleteDsaQuestion(questionId) {
            if (confirm('Are you sure you want to delete this question?')) {
                try {
                    await Alpine.store('main').apiCall(`/api/dsa/${questionId}`, 'DELETE');
                    this.getDsaSheetData();
                } catch (error) {
                    console.error("Failed to delete question:", error);
                }
            }
        },

        async toggleDsaSolve(questionId) {
            try {
                const solvedList = await Alpine.store('main').apiCall(`/api/dsa/${questionId}/solve`, 'PUT');
                Alpine.store('main').auth.solvedDSA = solvedList;
            } catch (error) {
                console.error("Failed to toggle solve status:", error);
            }
        },

        initSortable() {
            this.$nextTick(() => {
                const list = document.getElementById('reorder-list');
                if (list) {
                    this.sortableInstance = Sortable.create(list, { animation: 150, ghostClass: 'bg-sky-100' });
                }
            });
        },

        async saveTopicOrder() {
            if (this.sortableInstance) {
                const orderedTopicNames = this.sortableInstance.toArray();
                try {
                    await Alpine.store('main').apiCall('/api/dsa/topics/reorder', 'POST', { orderedTopics: orderedTopicNames });
                    this.showReorderModal = false;
                    this.getDsaSheetData();
                } catch (error) {
                    alert('Failed to save the new order.');
                }
            }
        }
    };
}
