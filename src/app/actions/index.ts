'use server';

// This barrel file re-exports all server actions.
// It cannot use `export * from ...` because of Next.js limitations with server actions.
// Each action must be explicitly imported and re-exported.

// From auth.actions.ts
export { forgotPassword } from './auth.actions';

// From chat.actions.ts
export { sendMessage, markChatAsRead } from './chat.actions';

// From forum.actions.ts
export { 
    createForumPost, 
    createForumComment,
    deleteForumPost,
    editForumPost,
    deleteForumComment,
    editForumComment
} from './forum.actions';

// From institution.actions.ts
export {
    createInstitution,
    updateInstitution,
    deleteInstitution,
    createIndependentTutorGroup,
    updateIndependentTutorGroup,
    deleteIndependentTutorGroup,
    registerTutor
} from './institution.actions';

// From psych-test.actions.ts
export {
    createPsychologicalQuestion,
    updatePsychologicalQuestion,
    deletePsychologicalQuestion
} from './psych-test.actions';

// From tutor.actions.ts
export {
    registerHeroTutor,
    approveTutorRequest,
    rejectTutorRequest,
    verifyTutorAndLogin
} from './tutor.actions';

// From user.actions.ts
export {
    checkIfUserExists,
    register,
    updateUserRole,
    updateStudentProfile,
    updateTutorProfile,
    updateAdminProfile,
    createStudent,
    upgradeToHero,
    updateUser
} from './user.actions';

// From utils.ts
// These are not server actions but can be used by them.
// It's better if components import them directly from utils if needed on the client.
export { getAuthenticatedAppForUser, getFirebaseErrorMessage, generateUniqueCode } from './utils';
export type { State } from './utils';
export type { QuestionFormData } from './psych-test.actions';
