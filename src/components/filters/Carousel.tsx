import React, { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import Slider from 'react-slick';

const CarouselContainer = styled.div`
  position: relative;
  width: 100%;
`;

const EdgeOverlay = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 1;
  pointer-events: none; /* Allows clicks to pass through */
`;

const LeftEdge = styled(EdgeOverlay)`
  left: 0;
  width: 5%; /* Reduced from 10% to 5% */
`;

const RightEdge = styled(EdgeOverlay)`
  right: 0;
  width: 5%; /* Reduced from 10% to 5% */
`;

interface CarouselProps {
  children: React.ReactNode;
}

const Carousel: React.FC<CarouselProps> = ({ children }) => {
  const sliderRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScrollingLeft, setIsScrollingLeft] = useState(false);
  const [isScrollingRight, setIsScrollingRight] = useState(false);

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    arrows: false,
    variableWidth: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
    ],
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isScrollingLeft) {
      interval = setInterval(() => {
        sliderRef.current?.slickPrev();
      }, 300);
    } else if (isScrollingRight) {
      interval = setInterval(() => {
        sliderRef.current?.slickNext();
      }, 300);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isScrollingLeft, isScrollingRight]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const { left, width } = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - left;
    const edgeSize = width * 0.05; // Reduced from 0.1 (10%) to 0.05 (5%)

    if (mouseX <= edgeSize) {
      console.log('Entered Left Edge');
      setIsScrollingLeft(true);
      setIsScrollingRight(false);
    } else if (mouseX >= width - edgeSize) {
      console.log('Entered Right Edge');
      setIsScrollingRight(true);
      setIsScrollingLeft(false);
    } else {
      setIsScrollingLeft(false);
      setIsScrollingRight(false);
    }
  };

  const handleMouseLeave = () => {
    setIsScrollingLeft(false);
    setIsScrollingRight(false);
  };

  return (
    <CarouselContainer
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <Slider ref={sliderRef} {...settings}>
        {children}
      </Slider>
      <LeftEdge />
      <RightEdge />
    </CarouselContainer>
  );
};

export default Carousel;