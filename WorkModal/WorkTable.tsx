/* eslint-disable no-use-before-define */
/* eslint-disable react/prop-types */
import React, { useEffect, useState, useRef, useContext } from 'react';
import type { FC, ReactNode } from 'react';
import styled from '@emotion/styled';

// hooks
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// mui
import { Box, Drawer, Modal, Typography, Button, CardMedia, Container } from '@mui/material';
import { makeStyles } from '@mui/styles';
import TextField from '@mui/material/TextField';
import { CircularProgress } from '@mui/material';

// icon
import DragIcon from '../../../images/drag.svg';
import DelIcon from '../../../images/del.svg';
import SaveIcon from '../../../images/save.svg';
import CancelIcon from '../../../images/cancel.svg';
import EditIcon from '../../../images/edit.svg';
import videoIcon from '../../../images/videoThumb.svg';
import emptyImage from '@images/empty.svg';

// plugin
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// data
import { frameTextures } from '../../../constants/texture';
import firebase, { db } from '../../../lib/firebase';
import 'firebase/firestore';
import 'firebase/storage';

import MPContext from '@context/MPContext';

//components
import WorkDelModal from '../WorkModal/WorkDelModal';
import Toast from './ChangeToast';
import FrameSelectButton from '../ManageObjects/AddPainting/FrameSelectButton';

const useStyles = makeStyles({
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableWrap: {
    position: 'relative',
    width: '100%',
    height: 450,
    overflowY: 'scroll',
    '&.isProgress': {
      pointerEvents: 'none',
      overflow: 'hidden',
    },
  },
  thead: {
    borderBottom: '1px solid #212121',
  },
  th: {
    padding: '17px',
    textAlign: 'center',
    fontSize: 14,
    color: '#212121',
    fontWeight: 500,
  },
  tbody: {},
  td: {
    position: 'relative',
    padding: '17px',
    textAlign: 'center',
    fontSize: 14,
    color: '#212121',
    fontWeight: 500,
    borderBottom: '1px solid #CBD4E1',
    '&:nth-child(1)': {
      width: 36,
    },
    '&:nth-child(2)': {
      width: 65,
    },
    '&:nth-child(3)': {
      width: '15%',
    },
    '&:nth-child(4)': {
      width: 160,
    },
    '&:nth-child(5)': {
      width: 320,
    },
    '&:nth-child(6)': {
      width: 75,
    },
    '&:nth-child(7)': {
      width: 75,
    },
  },
  select: {
    width: '100%',
    '& .MuiSelect-select': {
      padding: '8px 10px',
    },
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: 10,
  },

  btn: {
    border: '1px solid #CBD4E1',
    borderRadius: 5,
  },
  iconBtn: {
    minWidth: 'auto',
    padding: 0,
  },
  btnTxt: {
    marginLeft: 5,
    color: '#1E2A3B',
  },
  txt: {
    fontSize: 14,
    color: '#1E2A3B',
    textAlign: 'center',
  },
  imageUrl: {
    width: '100%',
    height: 70,
    objectFit: 'cover',
  },
  video: {
    width: '100%',
    height: 70,
    objectFit: 'cover',
    display: 'inline',
  },
  field: {
    width: '94%',
    '& input': {
      padding: '3px 5px',
    },
  },
  field2: {
    width: '94%',
    '& .MuiOutlinedInput-root': {
      padding: '0 !important',
    },
    '& textarea': {
      padding: '12px',
      height: '46px !important',
      overflowY: 'scroll !important',
    },
  },
  read: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& p': {
      marginRight: 10,
      maxWidth: 150,
      wordBreak: 'keep-all',
      wordWrap: 'break-word',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    },
  },
  write: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  label: {
    width: 200,
    paddingTop: 10,
  },
  itemContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  frameTexturesContainer: {
    width: 300,
    left: 0,
    top: 35,
    display: 'flex',
    flexWrap: 'wrap',
  },
  toast: {
    position: 'relative',
    zIndex: 1402,
  },
  videoThumb: {
    position: 'relative',
  },
  videoIcon: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  count: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  frameType: {
    position: 'absolute',
    bottom: '-55px',
    right: 0,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    backgroundColor: 'rgba(255, 255, 255, 1)',
    border: '1px solid #CBD4E1',
    borderRadius: 5,
    width: 212,
    zIndex: 1,
  },
  frameThumb: {
    width: 36,
    height: 36,
    margin: 'auto',
    padding: 6,
    border: '1px solid #CBD4E1',
    borderRadius: 5,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    '& img': {
      width: 24,
      height: 24,
    },
  },
  emptyItemWrap: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: 450,
  },
  emptyTitle: {
    fontSize: 16,
    color: '#1E2A3B',
    marginBottom: 5,
    textAlign: 'center',
  },
  emptyTxt: {
    fontSize: 14,
    color: '#1E2A3B',
    textAlign: 'center',
  },
  emptyBox: {
    height: 246,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  emptyBox2: {
    height: 'auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countingNum: {
    fontSize: 24,
    color: '#94A3B8',
    margin: '20px 0',
    '& span': {
      color: '#5E1280',
    },
  },
  progress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
});

type Props = {
  exhibitionId?: string;
  setItemAmount: (amount: number) => void;
  isLoading?: boolean;
  setLoading?: (loading: boolean) => void;
};

const WorkTable: FC<Props> = ({ exhibitionId, setItemAmount, isLoading, setLoading }) => {
  const classes = useStyles();
  const cardRef = useRef(null);
  const location = useLocation();
  const { i18n } = useTranslation();
  const { mpFunction } = useContext(MPContext);

  const [data, setData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedValues, setEditedValues] = useState({ id: null, columnKey: null, value: '' });
  const [editingColumn, setEditingColumn] = useState(null);
  const [changeToast, setChangeToast] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [itemId, setItemId] = React.useState('');
  const [itemTitle, setItemTitle] = React.useState('');
  const [frameType, setFrameType] = useState(0);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const collection = 'Paintings';

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const getPaintingsCollectionRef = () => {
    return firebase.firestore().collection('Exhibition').doc(exhibitionId).collection('Paintings');
  };

  // 이미지 렌더링 함수
  const renderImage = (item) => <img src={item.originalImage.url} alt="imageUrl" className={classes.imageUrl} />;

  // 비디오 렌더링 함수
  const renderVideo = (item) => (
    <div className={classes.videoThumb}>
      <img src={videoIcon} className={classes.videoIcon} />
      <CardMedia id={'image'} ref={cardRef} image={item.videoUrl} component="video" className={classes.video} />
    </div>
  );

  const renderImageOrVideo = (item) => {
    if (item.fileType === 'image') {
      return renderImage(item);
    } else if (item.fileType === 'video') {
      return renderVideo(item);
    }
    return null;
  };

  // 드래그, 재정렬 함수
  const onDragEndHandler = async (result) => {
    if (!result.destination) return;

    const items = Array.from(data);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Reorder items based on the new index
    items.forEach((item, index) => {
      item.order = index + 1;
    });

    setData(items);

    try {
      const batch = firebase.firestore().batch();
      items.forEach((item) => {
        const docRef = getPaintingsCollectionRef().doc(item.id);
        batch.update(docRef, { order: item.order });
      });
      await batch.commit();
    } catch (error) {
      console.error('Firebase에서 순서 업데이트 중 오류:', error);
    } finally {
      setChangeToast(true);
    }
  };

  // 액자 타입 변경
  const handleFrameTypeChange = async (index, itemId, width, height) => {
    try {
      if (index === 9) {
        await firebase
          .firestore()
          .collection('Exhibition')
          .doc(exhibitionId)
          .collection('Paintings')
          .doc(itemId)
          .update({ frameType: index, imageType: 'canvas', hasFrame: false })
          .then(() => {
            mpFunction?.updateInput(itemId, {
              width: width / 100,
              height: height / 100,
              frameType: index,
              imageType: 'canvas',
              hasFrame: false,
            });
          });
      } else {
        await firebase
          .firestore()
          .collection('Exhibition')
          .doc(exhibitionId)
          .collection('Paintings')
          .doc(itemId)
          .update({
            frameType: index,
            frameThick: 3,
            imageType: 'frame',
            innerFrameThick: 10,
            outerFrameThick: 1,
            hasFrame: true,
          })
          .then(() => {
            mpFunction?.updateInput(itemId, {
              width: width / 100,
              height: height / 100,
              title: '',
              color: '#f5f5f5',
              unClickable: false,
              hasFrame: true,
              innerFrameThick: 0.1,
              outerFrameThick: 0.01,
              frameType: index,
              imageType: 'frame',
            });
          });
      }
    } catch (error) {
      console.error('Error updating frame type in Firebase:', error);
    }
  };

  const toggleFrameSelect = (itemId: string) => {
    setSelectedItemId((prev) => (prev === itemId ? null : itemId)); // 클릭된 아이템의 ID와 이전에 선택된 아이템의 ID를 비교하여 다르면 클릭된 아이템의 ID를 저장하고 같으면 null로 설정합니다.
  };

  // 작품 수정
  const handleEditClick = (id, columnKey, value) => {
    setEditingId(id);
    setEditingColumn(columnKey);
    setEditedValues({ id, columnKey, value });
  };

  // 작품 수정 저장
  const handleSaveClick = async (id, columnKey) => {
    try {
      await firebase
        .firestore()
        .collection('Exhibition')
        .doc(exhibitionId)
        .collection('Paintings')
        .doc(id)
        .update({ [columnKey]: editedValues.value })
        .then(() => {
          mpFunction?.updateInput(itemId, 'painting', 100, 100, {
            title: editedValues.value,
          });
        });
      setEditingId(null);
      setEditedValues({ id: null, columnKey: null, value: '' });
    } catch (error) {
      console.error('Error updating data in Firebase:', error);
    }
  };

  //작품 수정 취소
  const handleCancelClick = async (id, columnKey) => {
    setEditingId(null);
    setEditedValues({ id: null, columnKey: null, value: '' });
    setEditingColumn(null);
  };

  // 작품 삭제
  const handleDeleteItemClick = (itemId, itemTitle) => {
    setItemId(itemId);
    setItemTitle(itemTitle);
    handleOpen();
  };

  const handleEditSaveCancelClick = (id, columnKey, action) => {
    if (action === 'save') {
      handleSaveClick(id, columnKey);
    } else if (action === 'cancel') {
      handleCancelClick(id, columnKey);
    } else {
      handleEditClick(id, columnKey, data.find((item) => item.id === id)[columnKey]);
    }
  };

  useEffect(() => {
    if (exhibitionId) {
      let query = getPaintingsCollectionRef().where('isDeleted', '==', false).orderBy('order', 'asc');
      query.onSnapshot(
        function (querySnapshot) {
          let pts = [];
          querySnapshot.forEach(function (doc) {
            let clickActionType = doc.data().clickActionType
              ? doc.data().clickActionType
              : doc.data().unClickable
                ? 'none'
                : 'detailView';
            let info = {
              originalImage: doc.data().originalImage,
              originalImageUrl: doc.data().originalImage?.url,
              compressedImageUrl: doc.data().compressedImage?.url,
              thumbnailImageUrl: doc.data().thumbnailImage?.url || doc.data().originalImage?.url,
              imageType: doc.data().imageType ?? null,
              order: doc.data().order,
              width: doc.data().width ?? 100,
              height: doc.data().height ?? 100,
              frameThick: doc.data().frameThick ?? 3,
              title: doc.data().title ?? '',
              artist: doc.data().artist ?? null,
              description: doc.data().description.replace(/<br\s*\/?>/gm, '\n') ?? '',
              color: doc.data().color ?? '#f5f5f5',
              lineColor: doc.data().color ?? '#f5f5f5',
              unClickable: doc.data().unClickable ?? false,
              links: doc.data().links ?? null,
              hasFrame: doc.data().hasFrame ?? false,
              outerFrameThick: doc.data().outerFrameThick ?? 1,
              innerFrameThick: doc.data().innerFrameThick ?? 10,
              frameType: doc.data().frameType ?? 1,
              id: doc.id,
              type: doc.data().fileType ?? 1,
              clickActionType: clickActionType ?? null,
              clickActionLink: doc.data().clickActionLink ?? '',
              isHide: doc.data().isHide ?? false,
              videoUrl: doc.data().videoUrl ?? null,
              fileType: doc.data().fileType ?? null,
            };

            pts.push(info);
          });
          setData(pts);
          setLoading(false);
        },
        function (error) {
          console.error('데이터 가져오기 오류:', error);
        },
      );
    }
  }, [exhibitionId]);

  useEffect(() => {
    setItemAmount(data.length);
  }, [data.length]);

  return (
    <div className={classes.emptyItemWrap}>
      {isLoading ? (
        <CircularProgress></CircularProgress>
      ) : data.length !== 0 ? (
        <div className={classes.tableWrap}>
          <DragDropContext onDragEnd={onDragEndHandler}>
            <Droppable droppableId="table">
              {(provided) => (
                <table {...provided.droppableProps} ref={provided.innerRef} className={classes.table}>
                  <thead className={classes.thead}>
                    <tr>
                      <th className={classes.th}></th>
                      <th className={classes.th}>{i18n.t('순서')}</th>
                      <th className={classes.th}>{i18n.t('이미지/섬네일')}</th>
                      <th className={classes.th}>{i18n.t('타이틀')}</th>
                      <th className={classes.th}>{i18n.t('상세설명')}</th>
                      <th className={classes.th}>{i18n.t('액자타입')}</th>
                      <th className={classes.th}>{i18n.t('관리')}</th>
                    </tr>
                  </thead>
                  {data.length === 0 ? (
                    <CircularProgress></CircularProgress>
                  ) : (
                    <tbody className={classes.tbody}>
                      {data.map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                          {(provided) => (
                            <tr ref={provided.innerRef} {...provided.draggableProps}>
                              <td className={classes.td} {...provided.dragHandleProps}>
                                <img src={DragIcon} alt="Drag Icon" />
                              </td>
                              <td className={classes.td}>
                                <span className={classes.count}>{index + 1}</span>
                              </td>
                              <td className={classes.td}>{renderImageOrVideo(item)}</td>
                              <td className={classes.td}>
                                {editingId === item.id && editingColumn === 'title' ? (
                                  <div className={classes.write}>
                                    <TextField
                                      value={editedValues.value || ''}
                                      className={classes.field}
                                      onChange={(e) =>
                                        setEditedValues({ id: editingId, columnKey: 'title', value: e.target.value })
                                      }
                                      inputProps={{ maxLength: 20 }}
                                    />
                                    <div className={classes.column}>
                                      <Button
                                        onClick={() => handleSaveClick(item.id, 'title')}
                                        className={classes.iconBtn}
                                      >
                                        <img src={SaveIcon} />
                                      </Button>
                                      <Button
                                        onClick={() => handleCancelClick(item.id, 'title')}
                                        className={classes.iconBtn}
                                      >
                                        <img src={CancelIcon} />
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className={classes.read}>
                                    <p>{item.title}</p>
                                    <Button
                                      onClick={() => handleEditSaveCancelClick(item.id, 'title', item.title)}
                                      className={classes.iconBtn}
                                    >
                                      <img src={EditIcon} />
                                    </Button>
                                  </div>
                                )}
                              </td>
                              <td className={classes.td}>
                                {editingId === item.id && editingColumn === 'description' ? (
                                  <div className={classes.write}>
                                    <TextField
                                      multiline
                                      value={editedValues.value || ''}
                                      className={classes.field2}
                                      onChange={(e) =>
                                        setEditedValues({
                                          id: editingId,
                                          columnKey: 'description',
                                          value: e.target.value,
                                        })
                                      }
                                    />
                                    <div className={classes.column}>
                                      <Button
                                        onClick={() => handleSaveClick(item.id, 'description')}
                                        className={classes.iconBtn}
                                      >
                                        <img src={SaveIcon} />
                                      </Button>
                                      <Button
                                        onClick={() => handleCancelClick(item.id, 'description')}
                                        className={classes.iconBtn}
                                      >
                                        <img src={CancelIcon} />
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className={classes.write}>
                                    <TextField
                                      multiline
                                      value={item.description}
                                      className={classes.field2}
                                      InputProps={{ readOnly: true }}
                                      placeholder="작품 설명을 입력해 주세요"
                                      onClick={() =>
                                        handleEditSaveCancelClick(item.id, 'description', item.description)
                                      }
                                    />
                                  </div>
                                )}
                              </td>

                              <td className={classes.td}>
                                {item.fileType === 'video' ? null : (
                                  <>
                                    <div
                                      className={classes.frameThumb}
                                      onClick={() => {
                                        toggleFrameSelect(item.id);
                                      }}
                                    >
                                      <img
                                        src={frameTextures[item.frameType].thumbImageUrl}
                                        alt={frameTextures[item.frameType].thumbImageUrl}
                                      />
                                    </div>
                                    {selectedItemId === item.id && (
                                      <div className={classes.frameType}>
                                        {frameTextures.map((frame, index) => (
                                          <FrameSelectButton
                                            frame={frame}
                                            index={index}
                                            key={index}
                                            value={item.frameType}
                                            onClick={() => {
                                              handleFrameTypeChange(index, item.id, item.width, item.height);
                                              setFrameType(index);
                                              toggleFrameSelect(item.id);
                                            }}
                                          />
                                        ))}
                                      </div>
                                    )}
                                  </>
                                )}
                              </td>
                              <td className={classes.td}>
                                <Button
                                  onClick={() => {
                                    handleDeleteItemClick(item.id, item.title);
                                  }}
                                  className={classes.btn}
                                >
                                  <img src={DelIcon} alt="Delete Icon" />
                                  <span className={classes.btnTxt}>{i18n.t('삭제')}</span>
                                </Button>
                              </td>
                            </tr>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </tbody>
                  )}
                </table>
              )}
            </Droppable>
          </DragDropContext>
          <WorkDelModal
            open={open}
            onClose={handleClose}
            exhibitionId={exhibitionId}
            itemId={itemId}
            itemTitle={itemTitle}
            collection={collection}
            mpFunction={mpFunction}
          />
          {changeToast && (
            <div className={classes.toast}>
              <Toast show={changeToast} onClose={() => setChangeToast(false)} />
            </div>
          )}
        </div>
      ) : (
        <div className={classes.emptyBox}>
          <img src={emptyImage} alt="empty image" />
          <Typography variant="h6" component="h2" className={classes.emptyTitle}>
            {i18n.t('파일이 없어요!')}
          </Typography>
          <Typography variant="h6" component="h2" className={classes.emptyTxt}>
            {i18n.t('최소 20개 이상의 파일을 업로드 해주세요. (이미지, 동영상 등)')}
          </Typography>
        </div>
      )}
    </div>
  );
};
export default WorkTable;
