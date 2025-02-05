import React, { useEffect } from 'react';
import type { FC, ReactNode } from 'react';

// hooks
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// ui
import { Box, Drawer, Modal, Typography, Button } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';

// icon
import WarningIcon from '../../../images/warning.svg';

// data
import firebase from '../../../lib/firebase';
import 'firebase/firestore';
import { use } from 'i18next';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    position: 'relative',
    width: 'auto',
    maxWidth: '450px',
    borderRadius: 10,
    padding: 40,
    backgroundColor: '#fff',
    '&:focus-visible': {
      outline: 'none',
    },
  },
  header: {
    position: 'relative',
    textAlign: 'center',
  },
  txt: {
    margin: '25px 0',
  },
  name: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 5,
    wordBreak: 'keep-all',
    wordWrap: 'break-word',
  },
  title: {
    fontSize: 14,
    textAlign: 'center',
  },
  addBtn: {
    margin: '0 3px',
  },
  addIcon: {},
  closeIcon: {
    position: 'absolute',
    top: 25,
    right: 25,
    cursor: 'pointer',
  },
}));

type Props = {
  open: boolean;
  onClose: () => void;
  exhibitionId?: string;
  itemId: string;
  itemTitle: string;
  collection?: string;
  mpFunction?: any;
};

const WorkDelModal: FC<Props> = ({ open, onClose, exhibitionId, itemId, itemTitle, collection, mpFunction }) => {
  const classes = useStyles();
  const location = useLocation();
  const { i18n } = useTranslation();

  const handleDeleteClick = async (id: string) => {
    try {
      // Firebase에서 해당 작품의 문서를 업데이트하여 isDeleted를 true로 설정
      await firebase
        .firestore()
        .collection('Exhibition')
        .doc(exhibitionId)
        .collection(collection)
        .doc(id)
        .update({ isDeleted: true });
      onClose();
      mpFunction?.deleteObjectById(id);
    } catch (error) {
      console.error('Error updating data in Firebase:', error);
    }
  };

  return (
    <>
      <Modal open={open} onClose={onClose} className={classes.root}>
        <Box className={classes.box}>
          <CloseIcon fontSize="small" onClick={onClose} className={classes.closeIcon} />
          <div className={classes.header}>
            <img src={WarningIcon} />
            <div className={classes.txt}>
              <Typography variant="h6" component="h2" className={classes.name}>
                {i18n.t(`${itemTitle}`)}
              </Typography>
              <Typography variant="h6" component="h2" className={classes.title}>
                {i18n.t('선택하신 파일을 삭제하시겠습니까?')}
              </Typography>
            </div>
            <Button variant="outlined" onClick={onClose} className={classes.addBtn} color="primary">
              {i18n.t('취소')}
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                handleDeleteClick(itemId);
              }}
              className={classes.addBtn}
              color="primary"
            >
              {i18n.t('삭제하기')}
            </Button>
          </div>
        </Box>
      </Modal>
    </>
  );
};

export default WorkDelModal;
