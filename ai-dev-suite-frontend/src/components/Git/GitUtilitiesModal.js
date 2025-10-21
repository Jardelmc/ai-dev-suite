import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  FormControlLabel,
  Checkbox,
  IconButton,
} from "@mui/material";
import {
  CallSplit as BranchIcon,
  MergeType as MergeIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  AddToQueue as InitIcon,
} from "@mui/icons-material";
import {
  createGitBranch,
  mergeGitBranch,
  getProjectReferenceBranch,
  setProjectReferenceBranch,
  initGitRepository,
} from "../../services/api";
const GitUtilitiesModal = ({
  project,
  status,
  onClose,
  onSuccess,
  showNotification,
}) => {
  const [referenceBranch, setReferenceBranch] = useState("");
  const [newBranchName, setNewBranchName] = useState("");
  const [applyToSubProjects, setApplyToSubProjects] = useState(false);
  const [deleteAfterMerge, setDeleteAfterMerge] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingRef, setLoadingRef] = useState(false);
  const [initializing, setInitializing] = useState(false);

  const projectStatus = project ? status.find(s => s.projectId === project.id) : null;
  const isRepo = projectStatus?.isRepo;
  const isRootProject = projectStatus?.isRoot;
  const currentBranch = projectStatus?.currentBranch;
  const isReferenceBranch = currentBranch === referenceBranch;

  const fetchReferenceBranch = useCallback(async () => {
    if (project && isRepo) {
      setLoadingRef(true);
      try {
        const result = await getProjectReferenceBranch(project.id);
        setReferenceBranch(result.referenceBranch);
      } catch (error) {
        showNotification(
          `Erro ao buscar branch de referência: ${error.message}`,
          "error"
        );
        setReferenceBranch(currentBranch || "main");
      } finally {
        setLoadingRef(false);
      }
    } else if (isRepo) {
        setReferenceBranch(currentBranch || "main");
    }
  }, [project, currentBranch, showNotification, isRepo]);
  useEffect(() => {
    fetchReferenceBranch();
  }, [fetchReferenceBranch]);
  const handleSetReference = async () => {
    if (project && referenceBranch) {
      setLoading(true);
      try {
        await setProjectReferenceBranch({
          projectId: project.id,
          branchName: referenceBranch,
          applyToSubProjects: isRootProject && applyToSubProjects,
        });
        showNotification(
          `Branch de referência '${referenceBranch}' salva e checkout realizado.`,
          "success"
        );
        onSuccess(`Branch de referência atualizada para '${referenceBranch}'.`);
      } catch (error) {
        showNotification(
          `Erro ao definir branch de referência: ${error.message}`,
          "error"
        );
      } finally {
        setLoading(false);
      }
    }
  };
  const handleCreateBranch = async () => {
    setLoading(true);
    try {
      const results = await createGitBranch({
        projectId: project.id,
        newBranchName,
        referenceBranch,
        applyToSubProjects: isRootProject && applyToSubProjects,
      });
      const errors = results.filter((r) => !r.success);
      if (errors.length > 0) {
        throw new Error(
          errors.map((e) => `${e.directory}: ${e.error}`).join("; ")
        );
      }
      onSuccess(`Branch '${newBranchName}' criada com sucesso!`);
    } catch (error) {
      showNotification(`Erro ao criar branch: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };
  const handleMergeBranch = async () => {
    setLoading(true);
    try {
      const results = await mergeGitBranch({
        projectId: project.id,
        referenceBranch,
        deleteAfterMerge,
        applyToSubProjects: isRootProject && applyToSubProjects,
      });
      const errors = results.filter((r) => !r.success);
      if (errors.length > 0) {
        throw new Error(
          errors.map((e) => `${e.directory}: ${e.error}`).join("; ")
        );
      }
      onSuccess(`Merge para '${referenceBranch}' concluído com sucesso!`);
    } catch (error) {
      showNotification(`Erro ao fazer merge: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleInitialize = async () => {
    if (!project) return;
    setInitializing(true);
    try {
        const result = await initGitRepository({ projectId: project.id });
        onSuccess(result.message || "Repositório inicializado com sucesso!");
    } catch(error) {
        showNotification(`Erro ao inicializar repositório: ${error.message}`, "error");
    } finally {
        setInitializing(false);
    }
  };

  if (!projectStatus) {
    return (
        <>
            <DialogTitle>Carregando...</DialogTitle>
            <DialogContent><CircularProgress /></DialogContent>
            <DialogActions><Button onClick={onClose}>Fechar</Button></DialogActions>
        </>
    )
  }

  return (
    <>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Ferramentas Avançadas de Git
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {!isRepo ? (
            <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h6" gutterBottom>Repositório Git não encontrado</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Este projeto não parece ser um repositório Git. Inicialize um para usar as ferramentas avançadas.
                </Typography>
                <Button
                    variant="contained"
                    startIcon={initializing ? <CircularProgress size={20} color="inherit" /> : <InitIcon />}
                    onClick={handleInitialize}
                    disabled={initializing}
                >
                    {initializing ? 'Inicializando...' : 'Inicializar Repositório'}
                </Button>
            </Box>
        ) : (
            <>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 2 }}>
                <TextField
                    label="Branch de Referência"
                    value={referenceBranch}
                    onChange={(e) => setReferenceBranch(e.target.value)}
                    size="small"
                    helperText="Ex: main, master, develop"
                    disabled={loadingRef || loading}
                />
                <Button
                    onClick={handleSetReference}
                    size="small"
                    startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
                    disabled={loadingRef || loading}
                >
                    Salvar e Mudar
                </Button>
                {loadingRef && <CircularProgress size={20} />}
                </Box>
                <Divider sx={{ my: 2 }} />

                {isReferenceBranch ? (
                <Box>
                    <Typography variant="h6" gutterBottom>
                    <BranchIcon sx={{ mr: 1 }} />
                    Criar Nova Branch
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Crie uma nova branch a partir de{" "}
                    <strong>'{referenceBranch}'</strong>.
                    </Typography>
                    <TextField
                    label="Nome da Nova Branch"
                    value={newBranchName}
                    onChange={(e) => setNewBranchName(e.target.value)}
                    fullWidth
                    size="small"
                    placeholder="Ex: feature/new-login-system"
                    />
                </Box>
                ) : (
                <Box>
                    <Typography variant="h6" gutterBottom>
                    <MergeIcon sx={{ mr: 1 }} />
                    Fazer Merge
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Faça o merge da branch atual <strong>'{currentBranch}'</strong>{" "}
                    para a branch de referência <strong>'{referenceBranch}'</strong>.
                    </Typography>
                    <FormControlLabel
                    control={
                        <Checkbox
                        checked={deleteAfterMerge}
                        onChange={(e) => setDeleteAfterMerge(e.target.checked)}
                        />
                    }
                    label={`Excluir branch local '${currentBranch}' após o merge`}
                    />
                </Box>
                )}

                {isRootProject && (
                <FormControlLabel
                    control={
                    <Checkbox
                        checked={applyToSubProjects}
                        onChange={(e) => setApplyToSubProjects(e.target.checked)}
                    />
                    }
                    label="Aplicar para todos os sub-projetos"
                    sx={{ mt: 1, display: "block" }}
                />
                )}

                {!currentBranch && project && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                    Não foi possível determinar a branch atual. O projeto pode não ser
                    um repositório Git.
                </Alert>
                )}
            </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        {isRepo && (
            isReferenceBranch ? (
                <Button
                    variant="contained"
                    onClick={handleCreateBranch}
                    disabled={loading || loadingRef || !newBranchName.trim()}
                    startIcon={loading && <CircularProgress size={20} />}
                >
                    Criar Branch
                </Button>
                ) : (
                <Button
                    variant="contained"
                    onClick={handleMergeBranch}
                    disabled={loading || loadingRef || !currentBranch}
                    startIcon={loading && <CircularProgress size={20} />}
                >
                    Fazer Merge
                </Button>
            )
        )}
      </DialogActions>
    </>
  );
};

export default GitUtilitiesModal;