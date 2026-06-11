import { Button } from '@mui/material';
import React from 'react';
import ImageUploading from 'react-images-uploading';
import _ from 'lodash';
import PropTypes from 'prop-types';

export default function ImageUpload(props) {
  const {
    images,
    setImages,
    previewSize,
    maxNumber = 5,
    title = 'upload',
  } = props;
  const onChange = (imageList, addUpdateIndex) => {
    console.log(imageList, addUpdateIndex);
    setImages(imageList);
  };
  return (
    <ImageUploading
      multiple
      value={images}
      onChange={onChange}
      maxNumber={maxNumber}
      dataURLKey="data_url"
    >
      {({
        imageList,
        onImageUpload,
        // eslint-disable-next-line no-unused-vars
        onImageRemoveAll,
        onImageUpdate,
        onImageRemove,
        // eslint-disable-next-line no-unused-vars
        isDragging,
        dragProps,
      }) => (
        // write your building UI
        <div>
          <div className="flex justify-center">
            {imageList.map((image, index) => (
              <div key={index} className="my-4">
                <div className="flex justify-end text-red-500">
                  <i
                    className="fas fa-window-close cursor-pointer"
                    aria-hidden="true"
                    onClick={() => onImageRemove(index)}
                  ></i>
                </div>

                <img src={image.data_url} alt="" width={previewSize} />
              </div>
            ))}
          </div>
          <div className="flex justify-start">
            {_.size(imageList) < maxNumber && (
              <Button
                variant="contained"
                color="primary"
                onClick={onImageUpload}
                {...dragProps}
              >
                {title}
              </Button>
            )}
          </div>

          {/* <button onClick={onImageRemoveAll}>Remove all images</button> */}
        </div>
      )}
    </ImageUploading>
  );
}

ImageUpload.defaultProps = {
  previewSize: '250',
  maxNumber: 5,
};

ImageUpload.propTypes = {
  previewSize: PropTypes.string,
  images: PropTypes.arrayOf(PropTypes.object),
  setImages: PropTypes.func.isRequired,
  maxNumber: PropTypes.number,
  title: PropTypes.string,
};
