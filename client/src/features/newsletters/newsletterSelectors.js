export const selectNewsletters = (state) => state.newsletters.items;
export const selectSelectedNewsletter = (state) => state.newsletters.selectedNewsletter;
export const selectNewsletterLoading = (state) => state.newsletters.loading;
export const selectNewsletterError = (state) => state.newsletters.error;
export const selectActiveSubscriberCount = (state) => state.newsletters.activeSubscriberCount;
