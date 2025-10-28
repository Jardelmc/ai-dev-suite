const Joi = require("joi");

const gitCommitSchema = Joi.object({
  projectId: Joi.string().uuid().messages({
    "string.guid": "Project ID must be a valid UUID.",
  }),
  projectDir: Joi.string().messages({
    "string.base": "Project directory must be a string.",
  }),
  commitMessage: Joi.string().allow("").messages({
    "string.base": "Commit message must be a string.",
  }),
})
  .xor("projectId", "projectDir")
  .messages({
    "object.xor":
      "Either projectId or projectDir must be provided, but not both.",
  });
const gitRevertSchema = Joi.object({
  projectId: Joi.string().uuid().messages({
    "string.guid": "Project ID must be a valid UUID.",
  }),
  projectDir: Joi.string().messages({
    "string.base": "Project directory must be a string.",
  }),
})
  .xor("projectId", "projectDir")
  .messages({
    "object.xor":
      "Either projectId or projectDir must be provided, but not both.",
  });
const createBranchSchema = Joi.object({
  projectId: Joi.string().uuid().required(),
  newBranchName: Joi.string().trim().min(1).required(),
  referenceBranch: Joi.string().trim().min(1).required(),
  applyToSubProjects: Joi.boolean().required(),
});
const mergeBranchSchema = Joi.object({
  projectId: Joi.string().uuid().required(),
  referenceBranch: Joi.string().trim().min(1).required(),
  deleteAfterMerge: Joi.boolean().required(),
  applyToSubProjects: Joi.boolean().required(),
});
const setReferenceBranchSchema = Joi.object({
  projectId: Joi.string().uuid().required(),
  branchName: Joi.string().trim().min(1).required(),
  applyToSubProjects: Joi.boolean().required(),
});
const initRepoSchema = Joi.object({
  projectId: Joi.string().uuid().required(),
});

const remoteSchema = Joi.object({
  projectId: Joi.string().uuid().required(),
  applyToSubProjects: Joi.boolean().required(),
  remoteName: Joi.string().trim().min(1).required(),
  remoteUrl: Joi.string().required(),
});
const removeRemoteSchema = Joi.object({
  projectId: Joi.string().uuid().required(),
  applyToSubProjects: Joi.boolean().required(),
  remoteName: Joi.string().trim().min(1).required(),
});
const pushPullSchema = Joi.object({
  projectId: Joi.string().uuid().required(),
  applyToSubProjects: Joi.boolean().required(),
  remoteName: Joi.string().trim().min(1).required(),
});
const cloneRepoSchema = Joi.object({
  parentId: Joi.string().uuid().allow(null),
  repositoryUrl: Joi.string().required(),
  projectName: Joi.string().required(),
  directory: Joi.string().required(),
});

// New schema for checkout
const checkoutBranchSchema = Joi.object({
  projectId: Joi.string().uuid().required(),
  branchName: Joi.string().trim().min(1).required(),
  applyToSubProjects: Joi.boolean().required(),
});

module.exports = {
  gitCommitSchema,
  gitRevertSchema,
  createBranchSchema,
  mergeBranchSchema,
  setReferenceBranchSchema,
  initRepoSchema,
  remoteSchema,
  removeRemoteSchema,
  pushPullSchema,
  cloneRepoSchema,
  checkoutBranchSchema, // Export the new schema
};
