/* eslint-disable no-use-before-define */
/* eslint-disable react/prop-types */
import type { FC } from 'react';
import React, { useContext, useEffect, useState } from 'react';

// hooks
import { useTranslation } from 'react-i18next';

// ui
import { Close as CloseIcon } from '@mui/icons-material';
import { Box, Button, Modal, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';

// plugins
import ShortUniqueId from 'short-unique-id';
// components

// data
import MPContext from '@context/MPContext';
import { db } from '@lib/firebase';

// json
import batchInstallData20 from '@constants/BatchInstallJson/install20.json';
import batchInstallData21 from '@constants/BatchInstallJson/install21.json';
import batchInstallData22 from '@constants/BatchInstallJson/install22.json';
import batchInstallData23 from '@constants/BatchInstallJson/install23.json';
import batchInstallData24 from '@constants/BatchInstallJson/install24.json';
import batchInstallData25 from '@constants/BatchInstallJson/install25.json';
import batchInstallData26 from '@constants/BatchInstallJson/install26.json';
import batchInstallData27 from '@constants/BatchInstallJson/install27.json';
import batchInstallData28 from '@constants/BatchInstallJson/install28.json';
import batchInstallData29 from '@constants/BatchInstallJson/install29.json';
import batchInstallData30 from '@constants/BatchInstallJson/install30.json';
import batchInstallData31 from '@constants/BatchInstallJson/install31.json';
import batchInstallData32 from '@constants/BatchInstallJson/install32.json';
import batchInstallData33 from '@constants/BatchInstallJson/install33.json';
import batchInstallData34 from '@constants/BatchInstallJson/install34.json';
import batchInstallData35 from '@constants/BatchInstallJson/install35.json';

import { initialInstallData } from '@constants/initialInstallData';

// icon
import WarningIcon from '@images/warning.svg';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    position: 'relative',
    width: 'auto',
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
  },
  notice: {
    fontSize: 16,
    textAlign: 'center',
    color: '#5E1280',
    marginTop: 5,
    marginBottom: 15,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 14,
    textAlign: 'center',
  },
  title2: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 25,
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
});

type Props = {
  open: boolean;
  onClose: () => void;
  onCloseInstall: () => void;
  itemAmount: number;
  installedItems?: any[];
  exhibitionId?: string;
  deserialize?: any;
  deleteItems?: any;
  setInstalledItems?: (any) => void;
};

const batchInstallData = [
  batchInstallData20,
  batchInstallData21,
  batchInstallData22,
  batchInstallData23,
  batchInstallData24,
  batchInstallData25,
  batchInstallData26,
  batchInstallData27,
  batchInstallData28,
  batchInstallData29,
  batchInstallData30,
  batchInstallData31,
  batchInstallData32,
  batchInstallData33,
  batchInstallData34,
  batchInstallData35,
];

const WorkInstallModal: FC<Props> = ({
  open,
  onClose,
  onCloseInstall,
  itemAmount,
  installedItems,
  setInstalledItems,
  exhibitionId,
}) => {
  const classes = useStyles();
  const { mpFunction, objectList, deletedObjectIdList } = useContext(MPContext);
  const { i18n } = useTranslation();
  const [exInfoTitle, setExInfoTitle] = useState('');
  const [exInfoContent, setExInfoContent] = useState('');
  const [isDraft, setDraft] = useState(false);

  const batchInstall = async () => {
    onClose();
    onCloseInstall();
    try {
      const serializedData = await mpFunction.publish();
      const jsonData = JSON.parse(serializedData);

      const excludedIds = ['bbbbbbbbbb', 'cccccccccc', 'dddddddddd']; // 벽면에 자동 설치되는 오브젝트 id
      const installedObjectsData = jsonData.payload.objects.filter((item) => {
        const component = item?.components?.[0];
        if (!component) {
          return false;
        }
        // 이미지와 비디오를 제외한 오브젝트는 재설치함.
        const isDesiredType = component.type === 'mp.lettersModel' || component.type === 'mp.audioModel';

        const isExcludedId = excludedIds.includes(component.inputs?.id);

        return isDesiredType && !isExcludedId;
      });

      let data = [];
      const fetchDataFromDatabase = async () => {
        try {
          const snapshot = await db
            .collection(`Exhibition/${exhibitionId}/Paintings`)
            .where('isDeleted', '==', false)
            .orderBy('order')
            .get();

          const dataWithDocId = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          data = dataWithDocId;
        } catch (error) {
          console.error('Error fetching data from database:', error);
        }
      };
      if (exhibitionId) {
        await fetchDataFromDatabase();
      } else {
        return;
      }

      const defaultJsonData = {
        version: '2.0',
        payload: {
          objects: [],
        },
      };
      const batchData = batchInstallData[itemAmount - 20];
      if (data.length === batchData.payload.objects.length) {
        const jsonData = batchData.payload.objects;

        const installItems = jsonData.map((item, idx) => {
          const dataItem = data[idx];
          const specificName = dataItem.fileType === 'video' ? 'video' : 'painting';
          const specificType = dataItem.fileType === 'video' ? 'mp.videoModel' : 'mp.paintingModel';

          const updatedComponents = item.components.map((component, componentIdx) => {
            if (component.inputs) {
              const commonJson = {
                position: component.inputs.position,
                quaternion: component.inputs.quaternion,
                normal: component.inputs.normal,
                id: component.inputs.id,
                title: component.inputs.title,
                width: component.inputs.width,
                height: component.inputs.height,
                depth: component.inputs.depth,
                color: component.inputs.color,
                visible: component.inputs.visible,
                opacity: component.inputs.opacity,
                lineOpacity: component.inputs.lineOpacity,
                type: component.inputs.type,
                objectId: new ShortUniqueId().randomUUID(6),
              };
              const specificInputs =
                dataItem.fileType === 'video'
                  ? {
                      position: component.inputs.position,
                      id: dataItem.id,
                      order: dataItem.order,
                      title: dataItem.title,
                      videoUrl: dataItem.videoUrl,
                      videoType: dataItem.videoType,
                      objectType: dataItem.objectType,
                      youtubeLink: dataItem.youtubeLink,
                      playType: dataItem.playType,
                      isPlay: false,
                    }
                  : {
                      id: dataItem.id,
                      order: dataItem.order,
                      title: dataItem.title,
                      compressedImageUrl: dataItem.compressedImage?.url,
                      thumbnailImageUrl: dataItem.thumbnailImage?.url,
                      originalImageUrl: dataItem.originalImage?.url,
                      imageUrl: dataItem.thumbnailImage?.url,
                      hasFrame: dataItem.hasFrame ?? true,
                      outerFrameThick: dataItem.outerFrameThick / 100 ?? 0.01,
                      innerFrameThick: dataItem.innerFrameThick / 100 ?? 0.1,
                      frameType: dataItem.frameType ?? 0,
                      imageType: dataItem.imageType ?? 'frame',
                    };

              let adjustedWidth, adjustedHeight;

              if (dataItem.width >= dataItem.height) {
                adjustedWidth = 1.2;
                adjustedHeight = dataItem.height * (1.2 / dataItem.width);
              } else {
                adjustedWidth = dataItem.width * (1.6 / dataItem.height);
                adjustedHeight = 1.6;
              }

              return {
                ...component,
                type: specificType,
                inputs: {
                  ...commonJson,
                  ...specificInputs,
                  width: dataItem.fileType === 'video' ? adjustedWidth - 0.22 : adjustedWidth - 0.22,
                  height: dataItem.fileType === 'video' ? adjustedHeight - 0.22 : adjustedHeight - 0.22,
                },
              };
            }
            return component;
          });

          return {
            ...item,
            name: specificName,
            components: updatedComponents,
          };
        });

        defaultJsonData.payload.objects = installItems;
        defaultJsonData.payload.objects.push(...initialInstallData, ...installedObjectsData);

        addPublished(defaultJsonData);
      } else {
        console.error(
          '데이터와 jsonData 배열의 길이가 일치하지 않습니다.',
          data.length,
          batchData.payload.objects.length,
        );
      }
    } catch (error) {
      console.error('일괄 설치 중 오류 발생:', error);
    }
  };

  const addPublished = async (publishedData) => {
    try {
      publishedData.payload.objects.forEach((lettersItem) => {
        const title = lettersItem.components[0].inputs.title;
        lettersItem.components[0].inputs.objectId = new ShortUniqueId().randomUUID(6);
        if (title === '전시 정보 제목') {
          lettersItem.components[0].inputs.content = exInfoTitle;
        }
        if (title === '전시 정보 내용') {
          lettersItem.components[0].inputs.content = exInfoContent;
        }
        if (title === '걸어보기') {
          lettersItem.components[0].inputs.content = '걸어보기 〉';
        }
      });
      const publishedItems = JSON.stringify(publishedData);

      mpFunction?.resetScene();
      mpFunction?.deserialize(publishedItems);

      setInstalledItems(JSON.parse(publishedItems));
    } catch (error) {
      console.error('Error adding data to the database:', error);
      console.error('Data that caused the error:', publishedData);
    }
  };

  useEffect(() => {
    if (exhibitionId) {
      const query = async () => {
        const snapshot = await db.collection('Exhibition').doc(exhibitionId).get();
        if (snapshot.exists) {
          const data = snapshot.data();
          setExInfoTitle(data.title);
          setExInfoContent(data.description);
        }
      };
      query();
      db.collection('Exhibition')
        .doc(exhibitionId)
        .collection('drafts')
        .get()
        .then((snapshot) => {
          if (snapshot.docs.length > 0) {
            setDraft(true);
          }
        });
    }
  }, [exhibitionId]);

  return (
    <>
      <Modal open={open} onClose={onClose} className={classes.root}>
        <Box className={classes.box}>
          <CloseIcon fontSize="small" onClick={onClose} className={classes.closeIcon} />
          {itemAmount < 20 ? (
            // 1조건: 20개 미만일 경우
            <div className={classes.header}>
              <div className={classes.txt}>
                <Typography variant="h6" component="h2" className={classes.title}>
                  {i18n.t('자동 설치 기능을 사용하기 위해서')}
                </Typography>
                <Typography variant="h6" component="h2" className={classes.title}>
                  {i18n.t('최소 20개 이상의 파일이 필요합니다.')}
                </Typography>
              </div>
              <Button variant="outlined" onClick={onClose} className={classes.addBtn} color="primary">
                {i18n.t('확인')}
              </Button>
            </div>
          ) : itemAmount <= 35 ? (
            // 1조건: 20개 이상 35개 이하일 경우
            <div className={classes.header}>
              {isDraft ? (
                // 2조건: 20~35 개일 때 installedItems.length -3 > 0 true
                <div className={classes.txt}>
                  <img src={WarningIcon} />
                  <Typography variant="h6" component="h2" className={classes.notice}>
                    {i18n.t('주의 해주세요.')}
                  </Typography>
                  <Typography variant="h6" component="h2" className={classes.title}>
                    {i18n.t('기존 설치된 파일은 모두 제거되며,')}
                  </Typography>
                  <Typography variant="h6" component="h2" className={classes.title}>
                    {i18n.t('현재 리스트에 따라 파일이 차례대로 재배치됩니다.')}
                  </Typography>
                  <Typography variant="h6" component="h2" className={classes.title2}>
                    {i18n.t('자동 재설치하시겠습니까?')}
                  </Typography>
                </div>
              ) : (
                // 2조건: 20~35 개일 때 installedItems.length -3 > 0 false
                <div className={classes.txt}>
                  <Typography variant="h6" component="h2" className={classes.title}>
                    {i18n.t('파일 리스트 순서에 따라')}
                  </Typography>
                  <Typography variant="h6" component="h2" className={classes.title}>
                    {i18n.t('전시관에 하나씩 차례대로 설치됩니다.')}
                  </Typography>
                  <Typography variant="h6" component="h2" className={classes.title2}>
                    {i18n.t('자동 설치하시겠습니까?')}
                  </Typography>
                </div>
              )}
              <Button variant="outlined" onClick={onClose} className={classes.addBtn} color="primary">
                {i18n.t('취소')}
              </Button>
              {isDraft ? (
                <Button variant="contained" onClick={batchInstall} className={classes.addBtn} color="primary">
                  {i18n.t('재설치하기')}
                </Button>
              ) : (
                <Button variant="contained" onClick={batchInstall} className={classes.addBtn} color="primary">
                  {i18n.t('설치하기')}
                </Button>
              )}
            </div>
          ) : (
            // 1조건: 35개 초과일 경우
            <div className={classes.header}>
              <div className={classes.txt}>
                <Typography variant="h6" component="h2" className={classes.title}>
                  {i18n.t('업로드 가능한 최대 파일 수(35개)를 초과했습니다.')}
                </Typography>
                <Typography variant="h6" component="h2" className={classes.title}>
                  {i18n.t(' 파일을 삭제한 후 추가해 주세요.')}
                </Typography>
              </div>
              <Button variant="outlined" onClick={onClose} className={classes.addBtn} color="primary">
                {i18n.t('확인')}
              </Button>
            </div>
          )}
        </Box>
      </Modal>
    </>
  );
};

export default WorkInstallModal;
