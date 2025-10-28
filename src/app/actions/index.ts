'use server';

// This barrel file re-exports all server actions.
// It cannot use `export * from ...` because of Next.js limitations with server actions.
// Each action must be explicitly imported and re-exported.

import {
    forgotPassword,
    checkIfUserExists,
    register,
    updateUserRole,
    updateStudentProfile,
    updateTutorProfile,
    updateAdminProfile,
    createStudent,
    upgradeToHero,
    updateUser,
    updateStudentSection,
} from './user.actions';

import { sendMessage, markChatAsRead } from './chat.actions';

import { 
    createForumPost, 
    createForumComment,
    deleteForumPost,
    editForumPost,
    deleteForumComment,
    editForumComment
} from './forum.actions';

import {
    createInstitution,
    updateInstitution,
    deleteInstitution,
    createIndependentTutorGroup,
    updateIndependentTutorGroup,
    deleteIndependentTutorGroup,
    registerTutor
} from './institution.actions';

import {
    createPsychologicalQuestion,
    updatePsychologicalQuestion,
    deletePsychologicalQuestion
} from './psych-test.actions';

import {
    registerHeroTutor,
    approveTutorRequest,
    rejectTutorRequest,
    verifyTutorAndLogin
} from './tutor.actions';

import { generateUniqueCode, getAuthenticatedAppForUser, getFirebaseErrorMessage } from './utils';
import type { State as UtilState } from './utils';
import type { QuestionFormData as PsychQuestionFormData } from './psych-test.actions';

// --- Re-exporting all functions ---

// User and Auth Actions
export {
  forgotPassword,
  checkIfUserExists,
  register,
  updateUserRole,
  updateStudentProfile,
  updateTutorProfile,
  updateAdminProfile,
  createStudent,
  upgradeToHero,
  updateUser,
  updateStudentSection
};

// Chat Actions
export { sendMessage, markChatAsRead };

// Forum Actions
export {
  createForumPost,
  createForumComment,
  deleteForumPost,
  editForumPost,
  deleteForumComment,
  editForumComment
};

// Institution Actions
export {
  createInstitution,
  updateInstitution,
  deleteInstitution,
  createIndependentTutorGroup,
  updateIndependentTutorGroup,
  deleteIndependentTutorGroup,
  registerTutor
};

// Psychological Test Actions
export {
  createPsychologicalQuestion,
  updatePsychologicalQuestion,
  deletePsychologicalQuestion
};

// Tutor Actions
export {
  registerHeroTutor,
  approveTutorRequest,
  rejectTutorRequest,
  verifyTutorAndLogin
};

// Utils (These are not server actions but can be used by them)
export { getAuthenticatedAppForUser, getFirebaseErrorMessage, generateUniqueCode };

// --- Re-exporting types ---
export type State = UtilState;
export type QuestionFormData = PsychQuestionFormData;
