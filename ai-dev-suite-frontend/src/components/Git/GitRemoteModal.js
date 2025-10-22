import React, { useState, useEffect, useCallback } from "react";
import {
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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tabs,
  Tab,
  Dialog,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import {
  Close as CloseIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as PushIcon,
  CloudDownload as PullIcon,
  VpnKey as RemoteIcon,
  Warning as WarningIcon,
  Sync as SyncIcon,
  ArrowUpward as AheadIcon,
  ArrowDownward as BehindIcon,
  CheckCircle as SyncedIcon,
  ArrowUpward,
} from "@mui/icons-material";
import {
  getGitRemotes,
  addGitRemote,
  removeGitRemote,
  pushToRemote,
  pullFromRemote,
  getRemoteStatus,
  getProjectReferenceBranch,
} from "../../services/api";

const GitRemoteModal = ({
  project,
  status,
  onClose,
  onSuccess,
  showNotification,
  onMergeConflict,
}) => {
  const [remotes, setRemotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState(null);
  const [remoteStatus, setRemoteStatus] = useState(null);
  const [view, setView] = useState("add");
  const [newRemoteName, setNewRemoteName] = useState("origin");
  const [newRemoteUrl, setNewRemoteUrl] = useState("");

  const [branchWarningOpen, setBranchWarningOpen] = useState(false);
  const [warningAcknowledged, setWarningAcknowledged] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState(null);
  const [branchForWarning, setBranchForWarning] = useState({ current: '', reference: '' });

  const [pushConfirmOpen, setPushConfirmOpen] = useState(false);
  const projectStatus = project
    ? status.find((s) => s.projectId === project.id)
    : null;
  const isRepo = projectStatus?.isRepo;
  const currentBranch = projectStatus?.currentBranch;

  const fetchRemotesAndStatus = useCallback(async () => {
    if (project && isRepo) {
      setLoading(true);
      setError("");
      setReport(null);
      try {
        const [remotesResult, statusResult] = await Promise.all([
          getGitRemotes(project.id),
          getRemoteStatus(project.id),
        ]);
        setRemotes(remotesResult);
        setRemoteStatus(statusResult);
        setView(remotesResult.length > 0 ? "list" : "add");
      } catch (e) {
        setError(`Erro ao buscar dados do remote: ${e.message}`);
      } finally {
        setLoading(false);
      }
    }
  }, [project, isRepo]);

  useEffect(() => {
    fetchRemotesAndStatus();
  }, [fetchRemotesAndStatus]);

  const handleAddRemote = async () => {
    setLoading(true);
    setError("");
    try {
      await addGitRemote({
        projectId: project.id,
        applyToSubProjects: false,
        remoteName: newRemoteName,
        remoteUrl: newRemoteUrl,
      });
      showNotification("Remote adicionado com sucesso!", "success");
      setNewRemoteName("origin");
      setNewRemoteUrl("");
      fetchRemotesAndStatus();
    } catch (e) {
      setError(`Erro ao adicionar remote: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRemote = async (remoteName) => {
    if (
      !window.confirm(
        `Tem certeza que deseja remover o remote '${remoteName}'?`
      )
    )
      return;
    setLoading(true);
    setError("");
    try {
      await removeGitRemote({
        projectId: project.id,
        applyToSubProjects: false,
        remoteName,
      });
      showNotification("Remote removido com sucesso!", "success");
      fetchRemotesAndStatus();
    } catch (e) {
      setError(`Erro ao remover remote: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const executePushOrPull = async (action) => {
    setLoading(true);
    setError("");
    setReport(null);
    try {
      const remoteName = remotes[0]?.name || "origin";
      let results;
      if (action === "push") {
        results = await pushToRemote({
          projectId: project.id,
          applyToSubProjects: false,
          remoteName,
        });
      } else {
        results = await pullFromRemote({
          projectId: project.id,
          applyToSubProjects: false,
          remoteName,
        });
      }

      const mainResult = results[0];
      if (mainResult.success) {
        setReport({
          severity: "success",
          message: mainResult.message,
          details: mainResult.summary,
        });
        fetchRemotesAndStatus();
      } else {
        if (mainResult.conflict) {
          onMergeConflict(mainResult.directory);
          setReport({
            severity: "error",
            message: "Conflito de Merge! Resolva os conflitos no VS Code.",
          });
        } else {
          throw new Error(mainResult.error);
        }
      }
    } catch (e) {
      setError(`Erro ao executar ${action}: ${e.message}`);
    } finally {
      setLoading(false);
      setPushConfirmOpen(false);
      setBranchWarningOpen(false);
      setWarningAcknowledged(false);
      setActionToConfirm(null);
    }
  };

  const handleActionClick = async (action) => {
    try {
        const refBranchResult = await getProjectReferenceBranch(project.id);
        const referenceBranch = refBranchResult.referenceBranch;

        if (currentBranch !== referenceBranch) {
            setBranchForWarning({ current: currentBranch, reference: referenceBranch });
            setActionToConfirm(action);
            setBranchWarningOpen(true);
        } else {
            if (action === "push") {
                setPushConfirmOpen(true);
            } else {
                executePushOrPull("pull");
            }
        }
    } catch (error) {
        showNotification(`Erro ao verificar a branch de referência: ${error.message}`, 'error');
    }
  };

  const handleConfirmBranchWarning = () => {
    setBranchWarningOpen(false);
    if (actionToConfirm === "push") {
      setPushConfirmOpen(true);
    } else {
      executePushOrPull(actionToConfirm);
    }
  };

  if (!projectStatus) {
    return (
      <DialogContent>
        <CircularProgress />
      </DialogContent>
    );
  }

  const renderStatusInfo = () => {
    if (!remoteStatus || remoteStatus.error) {
      return (
        <Alert severity="warning">
          {remoteStatus?.error || "Não foi possível obter o status do remote."}
        </Alert>
      );
    }

    const { ahead, behind } = remoteStatus;
    if (ahead === 0 && behind === 0) {
      return (
        <Alert severity="success" icon={<SyncedIcon fontSize="inherit" />}>
          Seu repositório local está sincronizado com o remote.
        </Alert>
      );
    }

    return (
      <Grid container spacing={1}>
        {behind > 0 && (
          <Grid item xs={12}>
            <Alert severity="info" icon={<ArrowDownward fontSize="inherit" />}>
              Existem <strong>{behind}</strong> commit(s) no remote para serem
              baixados (pull).
            </Alert>
          </Grid>
        )}
        {ahead > 0 && (
          <Grid item xs={12}>
            <Alert severity="warning" icon={<ArrowUpward fontSize="inherit" />}>
              Você possui <strong>{ahead}</strong> commit(s) locais para enviar
              (push).
            </Alert>
          </Grid>
        )}
      </Grid>
    );
  };

  return (
    <>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Gerenciamento de Remote
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {report && (
          <Alert severity={report.severity} sx={{ mb: 2 }}>
            {report.message}
          </Alert>
        )}

        {loading && !remotes.length ? (
          <CircularProgress />
        ) : !isRepo ? (
          <Alert severity="warning">
            Este projeto não é um repositório Git.
          </Alert>
        ) : (
          <>
            <Tabs
              value={view}
              onChange={(e, val) => setView(val)}
              sx={{ mb: 2 }}
            >
              <Tab
                label="Status & Ações"
                value="list"
                disabled={remotes.length === 0}
              />
              <Tab label="Adicionar/Ver Remotes" value="add" />
            </Tabs>

            {view === "list" && (
              <Box>
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Status do Remote
                    </Typography>
                    {loading ? (
                      <CircularProgress size={24} />
                    ) : (
                      renderStatusInfo()
                    )}
                  </CardContent>
                </Card>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={
                        loading ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <PullIcon />
                        )
                      }
                      onClick={() => handleActionClick("pull")}
                      disabled={loading || remoteStatus?.behind === 0}
                      size="large"
                    >
                      Pull
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      startIcon={
                        loading ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <PushIcon />
                        )
                      }
                      onClick={() => handleActionClick("push")}
                      disabled={loading || remoteStatus?.ahead === 0}
                      size="large"
                    >
                      Push
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}

            {view === "add" && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Remotes Atuais
                </Typography>
                {remotes.length > 0 ? (
                  <List dense>
                    {remotes.map((remote) => (
                      <ListItem key={remote.name}>
                        <ListItemText
                          primary={remote.name}
                          secondary={remote.refs.fetch}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => handleRemoveRemote(remote.name)}
                            disabled={loading}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Nenhum remote configurado.
                  </Typography>
                )}

                <Divider sx={{ my: 2 }}>
                  <Chip label="Adicionar Novo Remote" />
                </Divider>

                <TextField
                  label="Nome do Remote"
                  value={newRemoteName}
                  onChange={(e) => setNewRemoteName(e.target.value)}
                  fullWidth
                  margin="dense"
                  size="small"
                />
                <TextField
                  label="URL do Remote"
                  value={newRemoteUrl}
                  onChange={(e) => setNewRemoteUrl(e.target.value)}
                  fullWidth
                  margin="dense"
                  size="small"
                />
                <Button
                  onClick={handleAddRemote}
                  disabled={loading || !newRemoteName || !newRemoteUrl}
                  startIcon={<AddIcon />}
                  variant="outlined"
                  sx={{ mt: 1 }}
                >
                  Adicionar
                </Button>
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>

      <Dialog
        open={branchWarningOpen}
        onClose={() => setBranchWarningOpen(false)}
      >
        <DialogTitle>
          <WarningIcon
            color="warning"
            sx={{ verticalAlign: "middle", mr: 1 }}
          />
          Aviso de Branch
        </DialogTitle>
        <DialogContent>
          <Typography>
            Você não está na branch de referência do projeto.
          </Typography>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Branch Atual: <strong>{branchForWarning.current}</strong>
          </Typography>
           <Typography variant="body2" sx={{ mt: 1 }}>
            Branch de Referência: <strong>{branchForWarning.reference}</strong>
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={warningAcknowledged}
                onChange={(e) => setWarningAcknowledged(e.target.checked)}
              />
            }
            label="Eu entendo e desejo continuar."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBranchWarningOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleConfirmBranchWarning}
            disabled={!warningAcknowledged}
          >
            Continuar
          </Button>
        </DialogActions>
      </Dialog>
      
      <Dialog open={pushConfirmOpen} onClose={() => setPushConfirmOpen(false)}>
        <DialogTitle>Confirmar Push</DialogTitle>
        <DialogContent>
          <Typography>
             Você está prestes a enviar <strong>{remoteStatus?.ahead || 0} commit(s)</strong> para o remote na branch <strong>{currentBranch}</strong>.
          </Typography>
          <Typography sx={{mt: 2}}>
            Tem certeza que deseja continuar?
        </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPushConfirmOpen(false)}>Cancelar</Button>
          <Button onClick={() => executePushOrPull("push")} color="primary">
            Confirmar Push
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GitRemoteModal;