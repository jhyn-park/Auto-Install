/* eslint-disable prettier/prettier */
/* eslint-disable react/jsx-key */
import ModalContext from '@context/ModalContext';
import styled from '@emotion/styled';
import firebase, { firestore } from '@lib/firebase';
import { Button } from '@mui/material';
import { useDispatch, useSelector } from '@store';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

//mui
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import { CircularProgress } from '@mui/material';

//comp
import ImageUploadButton from '../../../ManageObjects/AddPainting/ImageUploadButton';
import WorkInstallModal from '../../../WorkModal/WorkInstallModal';
import WorkTable from '../../../WorkModal/WorkTable';

// icon

import { use } from 'i18next';

type Props = {
  mpFunction?: any;
  onClose: () => void;
  setInstalledItems?: (any) => void;
};

function index({ mpFunction, onClose, setInstalledItems }: Props) {
  const dispatch = useDispatch();

  const { i18n } = useTranslation();
  const {
    exhibitionData: { id },
  } = useSelector((state) => state.exhibition);
  const [exhibitionData, setExhibitionData] = useState<any>([]);
  const [installOpen, setInstallOpen] = useState(false);

  const [itemAmount, setItemAmount] = useState(0);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isUpload, setUpload] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const [addCount, setAddCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [maxAmount, setMaxAmount] = useState(35);

  const [imageData, setImageData] = useState({
    originalImage: { path: '', url: '', fileType: '' },
    thumbnailImage: { path: '', url: '' },
    compressedImage: { path: '', url: '' },
  });

  const [videoData, setVideoData] = useState({
    originalImage: { path: '', url: '', fileType: '' },
  });

  const handleInstallOpen = () => {
    setInstallOpen(true);
  };

  const handleInstallClose = () => {
    setInstallOpen(false);
  };

  const getExhibitionPaintingData = async () => {
    try {
      const snapshot = await firestore()
        .collection('Exhibition')
        .doc(id)
        .collection('Paintings')
        .where('isDeleted', '==', false)
        .get();

      if (!snapshot.empty) {
        let data = [];
        snapshot.docs.forEach((doc) => {
          const v = doc.data();
          data.push({ ...v, id: v.exhibitionId });
        });
        setExhibitionData(data);
      }
    } catch (e) {
      console.error('Get Exhibition Painting : ', e);
    }
  };

  useEffect(() => {
    const updateDatabase = async () => {
      try {
        const getMaxOrder = async () => {
          const snapshot = await firestore()
            .collection('Exhibition')
            .doc(id)
            .collection('Paintings')
            .orderBy('order', 'desc')
            .limit(1)
            .get();

          if (!snapshot.empty) {
            const maxOrderDoc = snapshot.docs[0];
            return maxOrderDoc.data().order || 0;
          } else {
            return 0;
          }
        };

        const maxOrder = await getMaxOrder();

        const imageFiles = [imageData];
        const videoFiles = [videoData];

        const commonData = {
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          description: '',
          frameThick: 3,
          isDeleted: false,
          title: '무제',
          updateAt: firebase.firestore.FieldValue.serverTimestamp(),
          order: maxOrder + 1,
        };

        const checkDuplicateAndAdd = async (file) => {
          if (file.originalImage.url !== '') {
            if (file.originalImage.fileType === 'image') {
              const isImageDuplicate = await firestore()
                .collection('Exhibition')
                .doc(id)
                .collection('Paintings')
                .where('originalImage.url', '==', file.originalImage.url)
                .get()
                .then((querySnapshot) => !querySnapshot.empty);

              if (!isImageDuplicate) {
                // 중복이 아닐 경우에만 추가
                const loadImage = (url: string): Promise<HTMLImageElement> => {
                  return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => resolve(img);
                    img.onerror = reject;
                    img.src = url;
                  });
                };

                const img = await loadImage(file.originalImage.url);

                const fixedWidth = 100;
                const aspectRatio = img.height / img.width;
                const fixedHeight = Math.round(fixedWidth * aspectRatio);

                await firestore()
                  .collection('Exhibition')
                  .doc(id)
                  .collection('Paintings')
                  .add({
                    autour: '',
                    clickActionLink: '',
                    clickActionType: '',
                    unClickable: false,
                    hasFrame: true,
                    frameType: 1,
                    outerFrameThick: 1,
                    color: '',
                    ...imageData,
                    fileType: file.originalImage.fileType,
                    links: [],
                    ...commonData,
                    height: fixedHeight,
                    imageType: 'frame',
                    innerFrameThick: 10,
                    isFixedRatio: true,
                    isHide: false,
                    width: fixedWidth,
                  });
              }
            } else if (file.originalImage.fileType === 'video') {
              console.log('Video file detected:', file);
              if (file.originalImage.url) {
                console.log('Video URL is defined:', file.videoUrl);
                const isVideoDuplicate = await firestore()
                  .collection('Exhibition')
                  .doc(id)
                  .collection('Paintings')
                  .where('videoUrl', '==', file.originalImage.url)
                  .get()
                  .then((querySnapshot) => !querySnapshot.empty);
                console.log('Is video duplicate?', isVideoDuplicate);
                if (!isVideoDuplicate) {
                  console.log('Adding video data to Firestore:', file);
                  const video = document.createElement('video');
                  video.preload = 'metadata';
                  video.src = file.originalImage.url;

                  await new Promise((resolve) => {
                    video.onloadedmetadata = () => resolve(video);
                  });

                  const fixedWidth = 100;
                  const aspectRatio = video.videoHeight / video.videoWidth;
                  const fixedHeight = Math.round(fixedWidth * aspectRatio);

                  await firestore()
                    .collection('Exhibition')
                    .doc(id)
                    .collection('Paintings')
                    .add({
                      videoUrl: file.originalImage.url,
                      path: file.originalImage.path,
                      fileType: file.originalImage.fileType,
                      ...commonData,
                      clickCount: 0,
                      height: fixedHeight,
                      objectType: 'canvas',
                      isDeleted: false,
                      youtubeLinks: '',
                      videoType: 'upload',
                      playType: 'modal',
                      width: fixedWidth,
                    });
                }
              } else {
                console.log('Video URL is undefined:', file.videoUrl);
              }
            }
          }
        };
        const processFiles = async () => {
          for (const file of imageFiles) {
            await checkDuplicateAndAdd(file);
          }
          for (const file of videoFiles) {
            await checkDuplicateAndAdd(file);
          }
        };
        await processFiles();
        await getExhibitionPaintingData();
      } catch (error) {
        console.error('문서 추가 중 오류 발생: ', error);
      }
    };
    if (id) {
      updateDatabase();
    }
  }, [imageData, videoData, id, firestore]);

  useEffect(() => {
    if (addCount === totalCount && addCount !== 0) {
      setTimeout(() => {
        setUpload(true);
        setTimeout(() => {
          setUpload(false);
        }, 2000);
      }, 2500);
    }
  }, [isAddingItem]);

  return (
    <>
      <Container>
        <Header>
          <AddButton>
            <ImageUploadButton
              disabled={isAddingItem}
              setImageData={setImageData}
              setVideoData={setVideoData}
              setTotalCount={setTotalCount}
              setIsAddingItem={setIsAddingItem}
              setAddCount={setAddCount}
              maxAmount={maxAmount}
              itemAmount={itemAmount}
            />
            <UploadAccount>
              {i18n.t('업로드 한 파일 수 ')}
              <Number>
                {itemAmount} / {maxAmount}
              </Number>
            </UploadAccount>
          </AddButton>
          <Title>{i18n.t('파일 관리')}</Title>
        </Header>
        <CloseButton>
          <CloseIcon fontSize="small" onClick={onClose} />
        </CloseButton>
        {isAddingItem ? (
          <Empty>
            <EmptyBox2>
              <CircularProgress />
              <CountNum>
                <CurrentSpan>{addCount}</CurrentSpan> / {totalCount === 0 ? 0 : totalCount}
              </CountNum>
              <Txt>{i18n.t('파일을 업로드 하는 중 입니다.')}</Txt>
            </EmptyBox2>
          </Empty>
        ) : (
          <WorkTable exhibitionId={id} setItemAmount={setItemAmount} isLoading={isLoading} setLoading={setLoading} />
        )}
        {/* {exhibitionData.length === 0 || itemAmount === 0 ? (
            <ImageUploadButton
              disabled={isAddingItem}
              setImageData={setImageData}
              setVideoData={setVideoData}
              setTotalCount={setTotalCount}
              setIsAddingItem={setIsAddingItem}
              setAddCount={setAddCount}
              maxAmount={maxAmount}
              itemAmount={itemAmount}
            />
          ) : null} */}
        {itemAmount === 0 ? null : (
          <Install>
            <Button color="primary" variant="contained" onClick={handleInstallOpen} disabled={isAddingItem}>
              {i18n.t('자동 설치')}
            </Button>
          </Install>
        )}
      </Container>
      <WorkInstallModal
        open={installOpen}
        onClose={handleInstallClose}
        onCloseInstall={onClose}
        itemAmount={itemAmount}
        installedItems={exhibitionData}
        setInstalledItems={setInstalledItems}
        exhibitionId={id}
      />
      {/* <UploadToast show={isUpload} /> */}
      {/* <UploadImageModal
        open={editModal && !targetData.videoUrl}
        onClose={() => {
          setEditModal(false);
          setOpenEditModal(false);
          setTargetData(null);
        }}
        type={'painting'}
        targetData={targetData}
        onAdd={onAddDataHandler}
      />
      <UploadVideoModal
        open={editModal && targetData.videoUrl}
        onClose={() => {
          setEditModal(false);
          setOpenEditModal(false);
          setTargetData(null);
        }}
        type={'video'}
        targetData={targetData}
        onAdd={onAddDataHandler}
      /> */}
    </>
  );
}
const Container = styled.div`
  padding: 40px;
  position: relative;
  width: 1200px;
  height: 650px;
  border-radius: 10px;
  overflow: hidden;
  background-color: #fff;
  '&:focus-visible': {
    outline: none;
  }
`;

const Header = styled.div`
  position: relative;
  margin-bottom: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const AddButton = styled.div`
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
`;
const CloseButton = styled.div`
  position: absolute;
  top: 25px;
  right: 25px;
  cursor: pointer;
`;

const UploadAccount = styled.div`
  font-size: 14px;
  color: #475569;
  margin-left: 10px;
`;
const Number = styled.span`
  font-size: 14px;
  color: #475569;
  font-weight: bold;
`;
const Title = styled.div`
  font-size: 24px;
  text-align: center;
`;
const Empty = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 450px;
`;
const EmptyBox2 = styled.div`
  height: auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
`;
const CountNum = styled.div`
  font-size: 24px;
  color: #94a3b8;
  margin: 20px 0;
`;
const CurrentSpan = styled.span`
  color: #5e1280;
`;
const Txt = styled.div`
  font-size: 14px;
  color: #1e2a3b;
  text-align: center;
`;
const Install = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  position: relative;
  z-index: 1401;
`;

export default index;
