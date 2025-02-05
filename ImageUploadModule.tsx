import React, { ReactElement, useState, useRef } from "react";

import { useTranslation } from "react-i18next";

import ControlPointSharpIcon from "@mui/icons-material/ControlPointSharp";
import InsertPhotoOutlinedIcon from "@mui/icons-material/InsertPhotoOutlined";
import HighlightOffSharpIcon from "@mui/icons-material/HighlightOffSharp";
interface Props {
  setSelectedFile: any;
}
export default function EventMainImageUploadModule(props: Props): ReactElement {
  const fileInputRef = useRef(null);
  const { setSelectedFile } = props;
  const { i18n } = useTranslation();
  const [imgBase64, setImgBase64] = useState("");

  const MAX_IMAGE_SIZE = 20;

  const fileSelectedHandler = (event) => {
    console.log(event.target.files);
    if (!event.target.files[0]) {
      return false;
    }
    let imageTypeText = event.target.files[0].type;
    if (!imageTypeText.includes("image")) {
      alert(i18n.t("이미지 파일을 업로드해주세요."));
      return false;
    }
    if (event.target.files[0].size > MAX_IMAGE_SIZE * 1048576) {
      alert(i18n.t("{{size}} MB 이하의 이미지를 업로드해주세요.", { size: MAX_IMAGE_SIZE }));
      return false;
    }

    let reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setImgBase64(base64.toString());
    };
    reader.readAsDataURL(event.target.files[0]);
    setSelectedFile(event.target.files[0]);
    return true;
  };

  const cancelNowfileUploadCase = () => {
    setImgBase64("");
    setSelectedFile(null);
  };
  const callUploadFun = () => {
    fileInputRef.current.click();
  };
  return (
    <>
      <div>
        <div
          style={{
            width: "500px",
            height: "250px",
            backgroundImage: `url(${imgBase64})`,
            backgroundPosition: "center center",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            borderRadius: "10px",
            border: "1px solid #ccc",
            margin: "15px 0",
            position: "relative",
          }}
        >
          {!imgBase64 && (
            <div
              onClick={callUploadFun}
              style={{
                cursor: "pointer",
                width: "100%",
                height: "100%",
                textAlign: "center",
                padding: "20px",
              }}
            >
              <InsertPhotoOutlinedIcon
                style={{
                  fontSize: "100px",
                }}
              />
              <br />
              <ControlPointSharpIcon />
              <br />
              {i18n.t("이미지 선택하기")}
              <br /> <br />
              {i18n.t("용량 {{size}}MB 이하의 이미지를 업로드 해주세요.", { size: MAX_IMAGE_SIZE })}
            </div>
          )}
          {imgBase64 && (
            <HighlightOffSharpIcon
              style={{
                fontSize: "40px",
                position: "absolute",
                right: "10px",
                top: "10px",
                zIndex: 10,
                cursor: "pointer",
              }}
              onClick={cancelNowfileUploadCase}
            />
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          name="imgFile"
          id="imgFile"
          onChange={fileSelectedHandler}
        />
      </div>
    </>
  );
}
