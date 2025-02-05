import React, { FC } from 'react';
import { Snackbar, IconButton, Slide } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import { Box, Drawer, Modal, Typography, Button } from '@mui/material';
import { makeStyles } from '@mui/styles';

import { useTranslation } from 'react-i18next';

import WarningIcon from '../../../images/warning.svg';

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

type ChangeToastProps = {
  show: boolean;
  onClose?: () => void;
};

const ChangeToast: FC<ChangeToastProps> = ({ show, onClose }) => {
  const classes = useStyles();
  const { i18n } = useTranslation();

  return (
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
        <div>
          <Typography variant="h6" component="h2" className={classes.txt}>
            {i18n.t('파일 리스트의 순서가 변경 되었습니다.')}
          </Typography>
          <Typography variant="h6" component="h2" className={classes.txt}>
            {i18n.t("변경된 순서를 적용하려면, '자동 설치' 버튼을 클릭해 주세요.")}
          </Typography>
        </div>
      </Box>
    </Snackbar>
  );
};

export default ChangeToast;
