import { useState, useEffect } from 'react';
import Searchbar from 'components/Searchbar';
import ImageGallery from 'components/Gallery/ImageGallery';
import fetchImg from 'services/services';
import Modal from 'components/Modal/Modal';
import Button from 'components/Button/Button';
import Loader from 'components/Loader/Loader';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Box } from './Box';

const App = () => {
  const [img, setImg] = useState([]);
  const [name, setName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [largeUrl, setLargeUrl] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalHits, setTotalHits] = useState([]);

  useEffect(() => {
    if (!name) {
      return;
    }
    fetchImages();
  }, [name]);

  const fetchImages = () => {
    setIsLoading(true);

    fetchImg
      .fetchImages(name, currentPage)

      .then(({ hits, totalHits }) => {
        const obj = hits.map(item => {
          return {
            id: item.id,
            url: item.webformatURL,
            largeUrl: item.largeImageURL,
          };
        });
        setTotalHits(totalHits);
        setImg(img => [...img, ...obj]);
        setCurrentPage(currentPage + 1);
      })

      .catch(error => {
        setError(error);
        toast.error('Oops ... Something went wrong ... try again');
      })
      .finally(() => {
        if (currentPage > 2) {
          window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'smooth',
            block: 'end',
          });
        }
        if (img.length > 0 && img.length === totalHits) {
          toast.error('no more');
        }
        setIsLoading(false);
      });
  };

  const onSearchSubmit = name => {
    setName(name);
    setCurrentPage(1);
    setImg([]);
    setError(null);
  };
  const onClickImg = url => {
    setLargeUrl(url);
    setShowModal(!showModal);
  };
  const shouldRenderLoadMore =
    img.length > 10 && img.length < totalHits && !isLoading;

  return (
    <>
      <Searchbar onSubmit={onSearchSubmit} />
      {showModal && (
        <Modal showModal={onClickImg}>
          <img src={largeUrl} alt={name} />
        </Modal>
      )}
      {img.length === 0 && (
        <Box
          display="flex"
          alignItems="center"
          flexDirection="column"
          color="blue"
          mt="40px"
        >{`No images for your request ${name}`}</Box>
      )}
      {error && <h1>ops ... Something went wrong ... try again</h1>}
      {name && (
        <ImageGallery imgData={img} showModal={onClickImg} name={name} />
      )}
      <Loader isLoading={isLoading} size={'100px'} color={'#3f51b5'} />
      {shouldRenderLoadMore && <Button onClick={fetchImg}></Button>}
      <ToastContainer autoClose={3000} />
      <div id="modalRoot"></div>
    </>
  );
};

export default App;
