import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Divider,
} from "@mui/material";
import {
  FolderOff as FolderOffIcon,
  DescriptionOutlined as DescriptionOutlinedIcon,
} from "@mui/icons-material";

const IgnoreListDisplay = ({ title, items }) => {
  if (!items || items.length === 0) {
    return (
      <Box sx={{ my: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Nenhum item.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ my: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        {title} ({items.length})
      </Typography>
      <Paper variant="outlined" sx={{ maxHeight: 120, overflow: "auto" }}>
        <List dense>
          {items.map((item, index) => (
            <React.Fragment key={item.id || index}>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  {item.path.includes(".") ? (
                    <DescriptionOutlinedIcon fontSize="small" />
                  ) : (
                    <FolderOffIcon fontSize="small" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={item.path}
                  primaryTypographyProps={{
                    variant: "body2",
                    sx: { fontFamily: "monospace", fontSize: "0.8rem" },
                  }}
                />
              </ListItem>
              {index < items.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default IgnoreListDisplay;
