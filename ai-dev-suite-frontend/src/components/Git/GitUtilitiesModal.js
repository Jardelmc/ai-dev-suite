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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  CallSplit as BranchIcon,
  MergeType as MergeIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  AddToQueue as InitIcon,
  SyncAlt as SwitchBranchIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import {
  createGitBranch,
  mergeGitBranch,
  getProjectReferenceBranch,
  setProjectReferenceBranch,
  initGitRepository,
  getGitLocalBranches, // Import new API call
  checkoutGitBranch,  // Import new API call
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
  const [localBranches, setLocalBranches] = useState([]);
  const [selectedBranchToCheckout, setSelectedBranchToCheckout] = useState('');
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [switchingBranch, setSwitchingBranch] = useState(false);


  const projectStatus = project ? status.find(s => s.projectId === project.id) : null;
  const isRepo = projectStatus?.isRepo;
  const isRootProject = projectStatus?.isRoot;
  const currentBranch = projectStatus?.currentBranch;
  const hasUncommittedChanges = projectStatus?.totalChanges > 0;
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

  const fetchLocalBranches = useCallback(async () => {
      if (project && isRepo && !hasUncommittedChanges) {
          setLoadingBranches(true);
          try {
              const branches = await getGitLocalBranches(project.id);
              setLocalBranches(branches || []);
              setSelectedBranchToCheckout(currentBranch || '');
          } catch (error) {
              showNotification(`Erro ao buscar branches locais: ${error.message}`, 'error');
              setLocalBranches([]);
          } finally {
              setLoadingBranches(false);
          }
      } else {
          setLocalBranches([]);
      }
  }, [project, isRepo, hasUncommittedChanges, currentBranch, showNotification]);


  useEffect(() => {
    fetchReferenceBranch();
    fetchLocalBranches(); // Fetch local branches when modal opens or dependencies change
  }, [fetchReferenceBranch, fetchLocalBranches]);

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
          `Preferência de branch de referência '${referenceBranch}' salva.`,
          "success"
        );
        onSuccess(`Branch de referência atualizada para '${referenceBranch}'.`); // Refresh main page status
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

  const handleSwitchBranch = async () => {
      if (!selectedBranchToCheckout || selectedBranchToCheckout === currentBranch) {
          showNotification('Selecione uma branch diferente da atual.', 'warning');
          return;
      }
      setSwitchingBranch(true);
      try {
          const results = await checkoutGitBranch({
              projectId: project.id,
              branchName: selectedBranchToCheckout,
              applyToSubProjects: isRootProject && applyToSubProjects,
          });
          const errors = results.filter((r) => !r.success);
          if (errors.length > 0) {
              throw new Error(
                  errors.map((e) => `${path.basename(e.directory)}: ${e.error}`).join("; ")
              );
          }
          onSuccess(`Checkout realizado para a branch '${selectedBranchToCheckout}' com sucesso!`);
      } catch (error) {
          showNotification(`Erro ao trocar de branch: ${error.message}`, 'error');
      } finally {
          setSwitchingBranch(false);
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
                {/* Reference Branch Section */}
                <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 2 }}>
                <TextField
                   label="Branch de Referência"
                    value={referenceBranch}
                    onChange={(e) => setReferenceBranch(e.target.value)}
                    size="small"
                    helperText="Ex: main, master, develop"
                    disabled={loadingRef || loading || switchingBranch}
                    sx={{ flexGrow: 1 }}
                />
                <Button
                    onClick={handleSetReference}
                    size="small"
                    startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
                    disabled={loadingRef || loading || switchingBranch || !referenceBranch || referenceBranch === projectStatus.referenceBranch}
                >
                    Salvar Preferência
                </Button>
                 {loadingRef && <CircularProgress size={20} />}
                </Box>
                <Divider sx={{ my: 2 }} />

                {/* Create/Merge Branch Section */}
                 {isReferenceBranch ? (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                        <BranchIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
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
                        disabled={loading || switchingBranch}
                        />
                        <Button
                             variant="contained"
                             onClick={handleCreateBranch}
                             disabled={loading || loadingRef || switchingBranch || !newBranchName.trim()}
                             startIcon={loading ? <CircularProgress size={20} color="inherit"/> : <BranchIcon />}
                             sx={{ mt: 2 }}
                         >
                            Criar Branch
                        </Button>
                    </Box>
                 ) : (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                        <MergeIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
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
                                disabled={loading || switchingBranch}
                                />
                            }
                            label={`Excluir branch local '${currentBranch}' após o merge`}
                        />
                        <Button
                             variant="contained"
                             onClick={handleMergeBranch}
                             disabled={loading || loadingRef || switchingBranch || !currentBranch || !referenceBranch}
                             startIcon={loading ? <CircularProgress size={20} color="inherit"/> : <MergeIcon />}
                             sx={{ mt: 2 }}
                         >
                            Fazer Merge para '{referenceBranch}'
                        </Button>
                    </Box>
                 )}

                {/* Apply to Subprojects Checkbox (only for root projects) */}
                {isRootProject && (
                    <FormControlLabel
                        control={
                           <Checkbox
                            checked={applyToSubProjects}
                            onChange={(e) => setApplyToSubProjects(e.target.checked)}
                            disabled={loading || switchingBranch}
                           />
                        }
                        label="Aplicar ação para todos os sub-projetos"
                        sx={{ mt: 1, display: "block" }}
                    />
                )}

                 <Divider sx={{ my: 3 }} />

                 {/* Switch Branch Section */}
                 <Box>
                    <Typography variant="h6" gutterBottom>
                        <SwitchBranchIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
                        Trocar de Branch (Checkout)
                    </Typography>
                    {hasUncommittedChanges ? (
                        <Alert severity="warning" sx={{ mt: 1 }}>
                            <Typography variant="body2">
                                Não é possível trocar de branch pois existem <strong>{projectStatus.totalChanges} alterações não commitadas</strong>. Faça o commit ou reverta as alterações primeiro.
                            </Typography>
                        </Alert>
                    ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                            <FormControl fullWidth size="small" disabled={loadingBranches || switchingBranch}>
                                <InputLabel>Selecionar Branch</InputLabel>
                                <Select
                                    value={selectedBranchToCheckout}
                                    label="Selecionar Branch"
                                    onChange={(e) => setSelectedBranchToCheckout(e.target.value)}
                                >
                                    {loadingBranches ? (
                                        <MenuItem disabled><CircularProgress size={20} sx={{ mr: 1 }}/> Carregando...</MenuItem>
                                    ) : localBranches.length === 0 ? (
                                        <MenuItem disabled>Nenhuma branch encontrada</MenuItem>
                                    ) : (
                                        localBranches.map((branch) => (
                                            <MenuItem key={branch} value={branch}>
                                                {branch === currentBranch ? `${branch} (Atual)` : branch}
                                            </MenuItem>
                                        ))
                                    )}
                                </Select>
                            </FormControl>
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={handleSwitchBranch}
                                disabled={loadingBranches || switchingBranch || !selectedBranchToCheckout || selectedBranchToCheckout === currentBranch}
                                startIcon={switchingBranch ? <CircularProgress size={20} color="inherit"/> : <SwitchBranchIcon />}
                            >
                                {switchingBranch ? 'Trocando...' : 'Trocar Branch'}
                            </Button>
                        </Box>
                    )}
                 </Box>

            </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
        {/* Actions buttons are now within their sections */}
      </DialogActions>
    </>
  );
};

export default GitUtilitiesModal;