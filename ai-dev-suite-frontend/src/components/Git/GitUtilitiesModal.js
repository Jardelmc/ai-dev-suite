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
  Grid,
  Paper,
  Tooltip,
} from "@mui/material";
import {
  CallSplit as BranchIcon,
  MergeType as MergeIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  AddToQueue as InitIcon,
  SyncAlt as SwitchBranchIcon,
  Warning as WarningIcon,
  SettingsBackupRestore as ReferenceIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import {
  createGitBranch,
  mergeGitBranch,
  getProjectReferenceBranch,
  setProjectReferenceBranch,
  initGitRepository,
  getGitLocalBranches,
  checkoutGitBranch,
} from "../../services/api";
import path from 'path-browserify'; // Use path-browserify for client-side path manipulation

const GitUtilitiesModal = ({
  project,
  status,
  onClose,
  onSuccess,
  showNotification,
}) => {
  const [referenceBranch, setReferenceBranch] = useState("");
  const [selectedReferenceBranch, setSelectedReferenceBranch] = useState("");
  const [newBranchName, setNewBranchName] = useState("");
  const [applyToSubProjects, setApplyToSubProjects] = useState(false);
  const [deleteAfterMerge, setDeleteAfterMerge] = useState(false);
  const [loading, setLoading] = useState(false); // Global loading for actions
  const [loadingRef, setLoadingRef] = useState(false); // Loading specific to reference branch fetch/set
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
        const refBranchName = result?.referenceBranch || currentBranch || "main";
        setReferenceBranch(refBranchName);
        setSelectedReferenceBranch(refBranchName);
      } catch (error) {
        showNotification(
          `Erro ao buscar branch de referência: ${error.message}`,
          "error"
        );
        const fallbackBranch = currentBranch || "main";
        setReferenceBranch(fallbackBranch);
        setSelectedReferenceBranch(fallbackBranch);
      } finally {
        setLoadingRef(false);
      }
    } else if (isRepo) {
        const fallbackBranch = currentBranch || "main";
        setReferenceBranch(fallbackBranch);
        setSelectedReferenceBranch(fallbackBranch);
    } else {
        setReferenceBranch("");
        setSelectedReferenceBranch("");
    }
  }, [project, currentBranch, showNotification, isRepo]);

  const fetchLocalBranches = useCallback(async () => {
      if (project && isRepo) {
          setLoadingBranches(true);
          try {
              const branches = await getGitLocalBranches(project.id);
              const sortedBranches = branches ? [...branches].sort() : []; // Sort branches alphabetically
              setLocalBranches(sortedBranches);
              setSelectedBranchToCheckout(currentBranch || (sortedBranches.length > 0 ? sortedBranches[0] : ''));
          }
          catch (error) {
              showNotification(`Erro ao buscar branches locais: ${error.message}`, 'error');
              setLocalBranches([]);
          }
          finally {
              setLoadingBranches(false);
          }
      } else {
          setLocalBranches([]);
      }
  }, [project, isRepo, currentBranch, showNotification]);

  useEffect(() => {
    fetchReferenceBranch();
    fetchLocalBranches();
  }, [fetchReferenceBranch, fetchLocalBranches]);

  const handleSetReference = async () => {
    if (project && selectedReferenceBranch) {
      setLoading(true);
      try {
        await setProjectReferenceBranch({
          projectId: project.id,
          branchName: selectedReferenceBranch,
          applyToSubProjects: isRootProject && applyToSubProjects,
        });
        showNotification(
          `Preferência de branch de referência '${selectedReferenceBranch}' salva.`,
          "success"
        );
        setReferenceBranch(selectedReferenceBranch);
        onSuccess(`Branch de referência atualizada para '${selectedReferenceBranch}'.`);
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
        const errorMessages = errors.map(e => `${e.directory ? path.basename(e.directory) : 'Unknown Project'}: ${e.error}`).join("; ");
        throw new Error(errorMessages);
      }
      onSuccess(`Branch '${newBranchName}' criada com sucesso!`);
      fetchLocalBranches(); // Refresh local branches list
      setNewBranchName(''); // Clear input
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
        const errorMessages = errors.map(e => `${e.directory ? path.basename(e.directory) : 'Unknown Project'}: ${e.error}`).join("; ");
        throw new Error(errorMessages);
      }
      onSuccess(`Merge para '${referenceBranch}' concluído com sucesso!`);
      fetchLocalBranches(); // Refresh local branches list, branch might be deleted
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
        // Re-fetch everything after initialization
        fetchReferenceBranch();
        fetchLocalBranches();
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
              const errorMessages = errors.map(e => `${e.directory ? path.basename(e.directory) : 'Unknown Project'}: ${e.error}`).join("; ");
              throw new Error(errorMessages);
          }
          onSuccess(`Checkout realizado para a branch '${selectedBranchToCheckout}' com sucesso!`);
          // Re-fetch status/branch info after checkout
          fetchReferenceBranch(); // This will likely update currentBranch used in fetchLocalBranches
          fetchLocalBranches();
      } catch (error) {
          showNotification(`Erro ao trocar de branch: ${error.message}`, 'error');
      } finally {
          setSwitchingBranch(false);
      }
  };

  if (!projectStatus && project) {
    return (
        <Dialog open onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Carregando...</DialogTitle>
            <DialogContent><CircularProgress /></DialogContent>
            <DialogActions><Button onClick={onClose}>Fechar</Button></DialogActions>
        </Dialog>
    )
  }

  const isAnyLoading = loading || loadingRef || initializing || loadingBranches || switchingBranch;

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pr: 1,
        }}
      >
        <Typography variant="h6" component="div">
          Ferramentas Avançadas de Git {project ? `- ${project.title}` : ''}
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ backgroundColor: 'grey.50', py: 3 }}>
        {!isRepo ? (
            <Paper elevation={2} sx={{ textAlign: 'center', p: 4, backgroundColor: 'background.paper' }}>
                <InitIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>Repositório Git não encontrado</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Este projeto não parece ser um repositório Git. Inicialize um para usar as ferramentas avançadas.
                </Typography>
                <Button
                    variant="contained"
                    startIcon={initializing ? <CircularProgress size={20} color="inherit" /> : <InitIcon />}
                    onClick={handleInitialize}
                    disabled={initializing || !project || isAnyLoading}
                    color="primary"
                    sx={{ px: 4, py: 1.5 }}
                >
                    {initializing ? 'Inicializando...' : 'Inicializar Repositório'}
                </Button>
            </Paper>
        ) : (
            <Grid container spacing={4}>
                {/* Section 1: Reference Branch */}
                <Grid item xs={12}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <ReferenceIcon sx={{ mr: 1, color: 'info.main' }} />
                            <Typography variant="h6" component="h3">Branch de Referência</Typography>
                            <Tooltip title="Define a branch principal do projeto (ex: main, master, develop). Usada como base para criar novas branches e para onde fazer merge.">
                                <InfoIcon color="action" sx={{ ml: 0.5, fontSize: 18 }} />
                            </Tooltip>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Defina a branch principal do projeto (ex: main, master, develop).
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 2 }}>
                            <FormControl fullWidth size="small" disabled={isAnyLoading}>
                                <InputLabel>Selecionar Branch de Referência</InputLabel>
                                <Select
                                    value={selectedReferenceBranch}
                                    label="Selecionar Branch de Referência"
                                    onChange={(e) => setSelectedReferenceBranch(e.target.value)}
                                    MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}
                                >
                                    {loadingBranches ? (
                                        <MenuItem disabled><CircularProgress size={20} sx={{ mr: 1 }}/> Carregando branches...</MenuItem>
                                    ) : localBranches.length === 0 ? (
                                        <MenuItem disabled>Nenhuma branch local encontrada</MenuItem>
                                    ) : (
                                        localBranches.map(branch => (
                                            <MenuItem key={branch} value={branch}>
                                                {branch}{branch === currentBranch ? ' (Atual)' : ''}
                                            </MenuItem>
                                        ))
                                    )}
                                </Select>
                            </FormControl>
                            <Button
                                onClick={handleSetReference}
                                size="medium"
                                variant="contained"
                                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                                disabled={isAnyLoading || !selectedReferenceBranch || selectedReferenceBranch === referenceBranch}
                                sx={{ minWidth: 150 }}
                            >
                                Salvar
                            </Button>
                        </Box>
                        {referenceBranch && (
                            <Alert severity="info" sx={{ mt: 1 }}>
                                Branch de referência atual salva: <strong>{referenceBranch}</strong>
                            </Alert>
                        )}
                    </Paper>
                </Grid>

                {/* Section 2: Create Branch */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <BranchIcon sx={{ mr: 1, color: 'success.main' }} />
                            <Typography variant="h6" component="h3">Criar Nova Branch</Typography>
                            <Tooltip title={`Crie uma nova branch a partir da branch de referência atual (${referenceBranch || 'N/A'}).`}>
                                <InfoIcon color="action" sx={{ ml: 0.5, fontSize: 18 }} />
                            </Tooltip>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            A partir de <strong>'{referenceBranch || 'N/A'}'</strong>.
                        </Typography>
                        <TextField
                            label="Nome da Nova Branch"
                            value={newBranchName}
                            onChange={(e) => setNewBranchName(e.target.value)}
                            fullWidth
                            size="small"
                            placeholder="Ex: feature/nova-funcionalidade"
                            disabled={isAnyLoading || !referenceBranch}
                            sx={{ mb: 2 }}
                        />
                        <Button
                            variant="contained"
                            color="success"
                            onClick={handleCreateBranch}
                            disabled={isAnyLoading || !newBranchName.trim() || !referenceBranch || hasUncommittedChanges}
                            startIcon={loading ? <CircularProgress size={20} color="inherit"/> : <BranchIcon />}
                            sx={{ py: 1.5 }}
                        >
                            Criar Branch
                        </Button>
                        {hasUncommittedChanges && <Alert severity="warning" sx={{mt: 2}} icon={<WarningIcon fontSize="inherit" />}>
                            Faça commit ou reverta as alterações ({projectStatus.totalChanges} pendentes) antes de criar uma branch.
                        </Alert>}
                    </Paper>
                </Grid>

                {/* Section 3: Merge Branch */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <MergeIcon sx={{ mr: 1, color: 'warning.main' }} />
                            <Typography variant="h6" component="h3">Fazer Merge</Typography>
                            <Tooltip title={`Faça o merge da branch atual (${currentBranch || 'N/A'}) para a branch de referência (${referenceBranch || 'N/A'}).`}>
                                <InfoIcon color="action" sx={{ ml: 0.5, fontSize: 18 }} />
                            </Tooltip>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Merge de <strong>'{currentBranch || 'N/A'}'</strong> para <strong>'{referenceBranch || 'N/A'}'</strong>.
                        </Typography>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={deleteAfterMerge}
                                    onChange={(e) => setDeleteAfterMerge(e.target.checked)}
                                    disabled={isAnyLoading || isReferenceBranch || !currentBranch}
                                />
                            }
                            label={
                                <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                                    Excluir branch local '{currentBranch || 'N/A'}' após o merge
                                    <Tooltip title="Esta opção excluirá a branch local que está sendo merged para a referência, após a conclusão bem-sucedida do merge.">
                                        <InfoIcon color="action" sx={{ ml: 0.5, fontSize: 16 }} />
                                    </Tooltip>
                                </Box>
                            }
                            sx={{ mb: 2 }}
                        />
                        <Button
                            variant="contained"
                            color="warning"
                            onClick={handleMergeBranch}
                            disabled={isAnyLoading || !currentBranch || !referenceBranch || isReferenceBranch || hasUncommittedChanges}
                            startIcon={loading ? <CircularProgress size={20} color="inherit"/> : <MergeIcon />}
                            sx={{ py: 1.5 }}
                        >
                            Fazer Merge
                        </Button>
                        {hasUncommittedChanges && <Alert severity="warning" sx={{mt: 2}} icon={<WarningIcon fontSize="inherit" />}>
                            Faça commit ou reverta as alterações ({projectStatus.totalChanges} pendentes) antes de fazer merge.
                        </Alert>}
                        {isReferenceBranch && currentBranch && (
                             <Alert severity="info" sx={{ mt: 2 }}>
                                Você já está na branch de referência '{currentBranch}'. Não é possível fazer merge para ela mesma.
                             </Alert>
                        )}
                    </Paper>
                </Grid>

                {/* Section 4: Switch Branch */}
                <Grid item xs={12}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <SwitchBranchIcon sx={{ mr: 1, color: 'secondary.main' }} />
                            <Typography variant="h6" component="h3">Trocar de Branch (Checkout)</Typography>
                            <Tooltip title="Mude para outra branch local existente no seu repositório.">
                                <InfoIcon color="action" sx={{ ml: 0.5, fontSize: 18 }} />
                            </Tooltip>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Branch atual: <Chip label={currentBranch || 'N/A'} size="small" color="primary" sx={{ ml: 0.5 }} />
                        </Typography>
                        {hasUncommittedChanges ? (
                            <Alert severity="warning" sx={{ mt: 1 }} icon={<WarningIcon fontSize="inherit" />}>
                                Não é possível trocar de branch pois existem <strong>{projectStatus.totalChanges} alterações não commitadas</strong>. Faça o commit ou reverta as alterações primeiro.
                            </Alert>
                        ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                                <FormControl fullWidth size="small" disabled={isAnyLoading}>
                                    <InputLabel>Selecionar Branch</InputLabel>
                                    <Select
                                        value={selectedBranchToCheckout}
                                        label="Selecionar Branch"
                                        onChange={(e) => setSelectedBranchToCheckout(e.target.value)}
                                        MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}
                                    >
                                        {loadingBranches ? (
                                            <MenuItem disabled><CircularProgress size={20} sx={{ mr: 1 }}/> Carregando...</MenuItem>
                                        ) : localBranches.length === 0 ? (
                                            <MenuItem disabled>Nenhuma branch encontrada</MenuItem>
                                        ) : (
                                            localBranches.map((branch) => (
                                                <MenuItem key={branch} value={branch}>
                                                    {branch}{branch === currentBranch ? ' (Atual)' : ''}
                                                </MenuItem>
                                            ))
                                        )}
                                    </Select>
                                </FormControl>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={handleSwitchBranch}
                                    disabled={isAnyLoading || !selectedBranchToCheckout || selectedBranchToCheckout === currentBranch}
                                    startIcon={switchingBranch ? <CircularProgress size={20} color="inherit"/> : <SwitchBranchIcon />}
                                    sx={{ minWidth: 150, py: 1 }}
                                >
                                    {switchingBranch ? 'Trocando...' : 'Trocar'}
                                </Button>
                            </Box>
                        )}
                    </Paper>
                </Grid>

                 {/* Apply to Subprojects Checkbox (only for root projects) */}
                 {isRootProject && (
                    <Grid item xs={12}>
                        <Paper elevation={2} sx={{ p: 2 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={applyToSubProjects}
                                        onChange={(e) => setApplyToSubProjects(e.target.checked)}
                                        disabled={isAnyLoading}
                                   />
                                }
                                label={
                                    <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                                        Aplicar ação a todos os sub-projetos deste projeto raiz
                                        <Tooltip title="Se marcado, a ação selecionada (definir referência, criar, merge, checkout) será replicada para todos os sub-projetos que também são repositórios Git dentro deste projeto raiz.">
                                            <InfoIcon color="action" sx={{ ml: 0.5, fontSize: 16 }} />
                                        </Tooltip>
                                    </Box>
                                }
                            />
                        </Paper>
                    </Grid>
                 )}
            </Grid>
        )}
      </DialogContent>
      <DialogActions sx={{ backgroundColor: 'grey.100', p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={onClose} variant="outlined">Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default GitUtilitiesModal;