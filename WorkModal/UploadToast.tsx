import React, { FC } from 'react';

import { Box, Typography } from '@mui/material';
import { Snackbar, IconButton, Slide } from '@mui/material';
import { makeStyles } from '@mui/styles';

import { useTranslation } from 'react-i18next';
import styled from '@emotion/styled';

import WarningIcon from '../../../images/warning.svg';
import CloseIcon from '@mui/icons-material/Close';

const useStyles = makeStyles((theme) => ({
  box: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: '25px 20px',
    borderRadius: 5,
  },
  txt: {
    display: 'block',
    marginLeft: 10,
    fontSize: 14,
    color: '#1E2A3B',
    lineHeight: 1.35,
  },
}));

type UploadToastProps = { show: boolean; onClose?: () => void };

const UploadToast: FC<UploadToastProps> = ({ show, onClose }) => {
  const classes = useStyles();
  const { i18n } = useTranslation();

  return (
    <>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        open={show}
        onClose={onClose}
        autoHideDuration={2000}
        TransitionComponent={(props) => <Slide {...props} direction={show ? 'left' : 'right'} />}
        action={
          <IconButton size="small" aria-label="close">
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      >
        <Box className={classes.box}>
          <img src={WarningIcon} />
          <Typography variant="h6" component="h2" className={classes.txt}>
            {i18n.t('업로드가 완료 되었습니다.')}
          </Typography>
        </Box>
      </Snackbar>
    </>
  );
};
export default UploadToast;
