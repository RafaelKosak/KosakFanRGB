import { useState, useEffect, useCallback } from 'react';
import { FaFan, FaMicrochip, FaMemory, FaQuestion, FaSync, FaStar, FaRegStar, FaSun, FaMoon, FaClone, FaTrash, FaDownload, FaUpload, FaCoffee, FaTimes } from 'react-icons/fa';
import { HexColorPicker } from 'react-colorful';
import './index.css';

const EFFECTS = [
  { id: 'static',     label: 'Estático' },
  { id: 'breathing',  label: 'Respiração' },
  { id: 'rainbow',    label: 'Rainbow' },
  { id: 'wave',       label: 'Onda' },
  { id: 'pulse',      label: 'Pulso' },
  { id: 'gradient',   label: 'Gradiente' },
  { id: 'blink',      label: 'Piscar' },
  { id: 'colorcycle', label: 'Ciclo de Cores' },
  { id: 'off',        label: 'Desligado' },
];

const ANIMATED_EFFECTS = ['breathing', 'rainbow', 'wave', 'pulse', 'blink', 'colorcycle'];

function hexToRgb(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r
    ? { red: parseInt(r[1], 16), green: parseInt(r[2], 16), blue: parseInt(r[3], 16) }
    : { red: 0, green: 0, blue: 0 };
}

function PixQRCode(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 225 225" {...props}>
      <rect fill="none" x="0" y="0" width="225" height="225" />
      <g id="elements">
        <path fill="currentColor" d="M 0,0 l 5,0 0,5 -5,0 z M 5,0 l 5,0 0,5 -5,0 z M 10,0 l 5,0 0,5 -5,0 z M 15,0 l 5,0 0,5 -5,0 z M 20,0 l 5,0 0,5 -5,0 z M 25,0 l 5,0 0,5 -5,0 z M 30,0 l 5,0 0,5 -5,0 z M 50,0 l 5,0 0,5 -5,0 z M 80,0 l 5,0 0,5 -5,0 z M 90,0 l 5,0 0,5 -5,0 z M 105,0 l 5,0 0,5 -5,0 z M 110,0 l 5,0 0,5 -5,0 z M 115,0 l 5,0 0,5 -5,0 z M 120,0 l 5,0 0,5 -5,0 z M 125,0 l 5,0 0,5 -5,0 z M 130,0 l 5,0 0,5 -5,0 z M 135,0 l 5,0 0,5 -5,0 z M 145,0 l 5,0 0,5 -5,0 z M 150,0 l 5,0 0,5 -5,0 z M 160,0 l 5,0 0,5 -5,0 z M 165,0 l 5,0 0,5 -5,0 z M 180,0 l 5,0 0,5 -5,0 z M 190,0 l 5,0 0,5 -5,0 z M 195,0 l 5,0 0,5 -5,0 z M 200,0 l 5,0 0,5 -5,0 z M 205,0 l 5,0 0,5 -5,0 z M 210,0 l 5,0 0,5 -5,0 z M 215,0 l 5,0 0,5 -5,0 z M 220,0 l 5,0 0,5 -5,0 z M 0,5 l 5,0 0,5 -5,0 z M 30,5 l 5,0 0,5 -5,0 z M 40,5 l 5,0 0,5 -5,0 z M 45,5 l 5,0 0,5 -5,0 z M 50,5 l 5,0 0,5 -5,0 z M 55,5 l 5,0 0,5 -5,0 z M 60,5 l 5,0 0,5 -5,0 z M 65,5 l 5,0 0,5 -5,0 z M 75,5 l 5,0 0,5 -5,0 z M 80,5 l 5,0 0,5 -5,0 z M 100,5 l 5,0 0,5 -5,0 z M 105,5 l 5,0 0,5 -5,0 z M 110,5 l 5,0 0,5 -5,0 z M 115,5 l 5,0 0,5 -5,0 z M 125,5 l 5,0 0,5 -5,0 z M 155,5 l 5,0 0,5 -5,0 z M 175,5 l 5,0 0,5 -5,0 z M 190,5 l 5,0 0,5 -5,0 z M 220,5 l 5,0 0,5 -5,0 z M 0,10 l 5,0 0,5 -5,0 z M 10,10 l 5,0 0,5 -5,0 z M 15,10 l 5,0 0,5 -5,0 z M 20,10 l 5,0 0,5 -5,0 z M 30,10 l 5,0 0,5 -5,0 z M 45,10 l 5,0 0,5 -5,0 z M 60,10 l 5,0 0,5 -5,0 z M 80,10 l 5,0 0,5 -5,0 z M 85,10 l 5,0 0,5 -5,0 z M 90,10 l 5,0 0,5 -5,0 z M 120,10 l 5,0 0,5 -5,0 z M 130,10 l 5,0 0,5 -5,0 z M 135,10 l 5,0 0,5 -5,0 z M 150,10 l 5,0 0,5 -5,0 z M 165,10 l 5,0 0,5 -5,0 z M 175,10 l 5,0 0,5 -5,0 z M 190,10 l 5,0 0,5 -5,0 z M 200,10 l 5,0 0,5 -5,0 z M 205,10 l 5,0 0,5 -5,0 z M 210,10 l 5,0 0,5 -5,0 z M 220,10 l 5,0 0,5 -5,0 z M 0,15 l 5,0 0,5 -5,0 z M 10,15 l 5,0 0,5 -5,0 z M 15,15 l 5,0 0,5 -5,0 z M 20,15 l 5,0 0,5 -5,0 z M 30,15 l 5,0 0,5 -5,0 z M 40,15 l 5,0 0,5 -5,0 z M 60,15 l 5,0 0,5 -5,0 z M 75,15 l 5,0 0,5 -5,0 z M 90,15 l 5,0 0,5 -5,0 z M 95,15 l 5,0 0,5 -5,0 z M 105,15 l 5,0 0,5 -5,0 z M 110,15 l 5,0 0,5 -5,0 z M 130,15 l 5,0 0,5 -5,0 z M 135,15 l 5,0 0,5 -5,0 z M 140,15 l 5,0 0,5 -5,0 z M 150,15 l 5,0 0,5 -5,0 z M 175,15 l 5,0 0,5 -5,0 z M 180,15 l 5,0 0,5 -5,0 z M 190,15 l 5,0 0,5 -5,0 z M 200,15 l 5,0 0,5 -5,0 z M 205,15 l 5,0 0,5 -5,0 z M 210,15 l 5,0 0,5 -5,0 z M 220,15 l 5,0 0,5 -5,0 z M 0,20 l 5,0 0,5 -5,0 z M 10,20 l 5,0 0,5 -5,0 z M 15,20 l 5,0 0,5 -5,0 z M 20,20 l 5,0 0,5 -5,0 z M 30,20 l 5,0 0,5 -5,0 z M 55,20 l 5,0 0,5 -5,0 z M 60,20 l 5,0 0,5 -5,0 z M 70,20 l 5,0 0,5 -5,0 z M 90,20 l 5,0 0,5 -5,0 z M 100,20 l 5,0 0,5 -5,0 z M 105,20 l 5,0 0,5 -5,0 z M 110,20 l 5,0 0,5 -5,0 z M 115,20 l 5,0 0,5 -5,0 z M 120,20 l 5,0 0,5 -5,0 z M 125,20 l 5,0 0,5 -5,0 z M 130,20 l 5,0 0,5 -5,0 z M 135,20 l 5,0 0,5 -5,0 z M 140,20 l 5,0 0,5 -5,0 z M 170,20 l 5,0 0,5 -5,0 z M 175,20 l 5,0 0,5 -5,0 z M 180,20 l 5,0 0,5 -5,0 z M 190,20 l 5,0 0,5 -5,0 z M 200,20 l 5,0 0,5 -5,0 z M 205,20 l 5,0 0,5 -5,0 z M 210,20 l 5,0 0,5 -5,0 z M 220,20 l 5,0 0,5 -5,0 z M 0,25 l 5,0 0,5 -5,0 z M 30,25 l 5,0 0,5 -5,0 z M 40,25 l 5,0 0,5 -5,0 z M 45,25 l 5,0 0,5 -5,0 z M 55,25 l 5,0 0,5 -5,0 z M 75,25 l 5,0 0,5 -5,0 z M 90,25 l 5,0 0,5 -5,0 z M 100,25 l 5,0 0,5 -5,0 z M 120,25 l 5,0 0,5 -5,0 z M 130,25 l 5,0 0,5 -5,0 z M 140,25 l 5,0 0,5 -5,0 z M 145,25 l 5,0 0,5 -5,0 z M 150,25 l 5,0 0,5 -5,0 z M 155,25 l 5,0 0,5 -5,0 z M 165,25 l 5,0 0,5 -5,0 z M 190,25 l 5,0 0,5 -5,0 z M 220,25 l 5,0 0,5 -5,0 z M 0,30 l 5,0 0,5 -5,0 z M 5,30 l 5,0 0,5 -5,0 z M 10,30 l 5,0 0,5 -5,0 z M 15,30 l 5,0 0,5 -5,0 z M 20,30 l 5,0 0,5 -5,0 z M 25,30 l 5,0 0,5 -5,0 z M 30,30 l 5,0 0,5 -5,0 z M 40,30 l 5,0 0,5 -5,0 z M 50,30 l 5,0 0,5 -5,0 z M 60,30 l 5,0 0,5 -5,0 z M 70,30 l 5,0 0,5 -5,0 z M 80,30 l 5,0 0,5 -5,0 z M 90,30 l 5,0 0,5 -5,0 z M 100,30 l 5,0 0,5 -5,0 z M 110,30 l 5,0 0,5 -5,0 z M 120,30 l 5,0 0,5 -5,0 z M 130,30 l 5,0 0,5 -5,0 z M 140,30 l 5,0 0,5 -5,0 z M 150,30 l 5,0 0,5 -5,0 z M 160,30 l 5,0 0,5 -5,0 z M 170,30 l 5,0 0,5 -5,0 z M 180,30 l 5,0 0,5 -5,0 z M 190,30 l 5,0 0,5 -5,0 z M 195,30 l 5,0 0,5 -5,0 z M 200,30 l 5,0 0,5 -5,0 z M 205,30 l 5,0 0,5 -5,0 z M 210,30 l 5,0 0,5 -5,0 z M 215,30 l 5,0 0,5 -5,0 z M 220,30 l 5,0 0,5 -5,0 z M 45,35 l 5,0 0,5 -5,0 z M 50,35 l 5,0 0,5 -5,0 z M 55,35 l 5,0 0,5 -5,0 z M 65,35 l 5,0 0,5 -5,0 z M 75,35 l 5,0 0,5 -5,0 z M 85,35 l 5,0 0,5 -5,0 z M 90,35 l 5,0 0,5 -5,0 z M 100,35 l 5,0 0,5 -5,0 z M 120,35 l 5,0 0,5 -5,0 z M 125,35 l 5,0 0,5 -5,0 z M 130,35 l 5,0 0,5 -5,0 z M 135,35 l 5,0 0,5 -5,0 z M 150,35 l 5,0 0,5 -5,0 z M 175,35 l 5,0 0,5 -5,0 z M 0,40 l 5,0 0,5 -5,0 z M 5,40 l 5,0 0,5 -5,0 z M 10,40 l 5,0 0,5 -5,0 z M 15,40 l 5,0 0,5 -5,0 z M 20,40 l 5,0 0,5 -5,0 z M 30,40 l 5,0 0,5 -5,0 z M 35,40 l 5,0 0,5 -5,0 z M 40,40 l 5,0 0,5 -5,0 z M 50,40 l 5,0 0,5 -5,0 z M 60,40 l 5,0 0,5 -5,0 z M 90,40 l 5,0 0,5 -5,0 z M 95,40 l 5,0 0,5 -5,0 z M 100,40 l 5,0 0,5 -5,0 z M 105,40 l 5,0 0,5 -5,0 z M 110,40 l 5,0 0,5 -5,0 z M 115,40 l 5,0 0,5 -5,0 z M 120,40 l 5,0 0,5 -5,0 z M 125,40 l 5,0 0,5 -5,0 z M 135,40 l 5,0 0,5 -5,0 z M 140,40 l 5,0 0,5 -5,0 z M 145,40 l 5,0 0,5 -5,0 z M 165,40 l 5,0 0,5 -5,0 z M 180,40 l 5,0 0,5 -5,0 z M 185,40 l 5,0 0,5 -5,0 z M 195,40 l 5,0 0,5 -5,0 z M 205,40 l 5,0 0,5 -5,0 z M 215,40 l 5,0 0,5 -5,0 z M 0,45 l 5,0 0,5 -5,0 z M 15,45 l 5,0 0,5 -5,0 z M 35,45 l 5,0 0,5 -5,0 z M 40,45 l 5,0 0,5 -5,0 z M 55,45 l 5,0 0,5 -5,0 z M 65,45 l 5,0 0,5 -5,0 z M 75,45 l 5,0 0,5 -5,0 z M 90,45 l 5,0 0,5 -5,0 z M 95,45 l 5,0 0,5 -5,0 z M 100,45 l 5,0 0,5 -5,0 z M 105,45 l 5,0 0,5 -5,0 z M 110,45 l 5,0 0,5 -5,0 z M 150,45 l 5,0 0,5 -5,0 z M 180,45 l 5,0 0,5 -5,0 z M 190,45 l 5,0 0,5 -5,0 z M 195,45 l 5,0 0,5 -5,0 z M 205,45 l 5,0 0,5 -5,0 z M 0,50 l 5,0 0,5 -5,0 z M 20,50 l 5,0 0,5 -5,0 z M 30,50 l 5,0 0,5 -5,0 z M 35,50 l 5,0 0,5 -5,0 z M 40,50 l 5,0 0,5 -5,0 z M 50,50 l 5,0 0,5 -5,0 z M 55,50 l 5,0 0,5 -5,0 z M 60,50 l 5,0 0,5 -5,0 z M 65,50 l 5,0 0,5 -5,0 z M 70,50 l 5,0 0,5 -5,0 z M 85,50 l 5,0 0,5 -5,0 z M 90,50 l 5,0 0,5 -5,0 z M 100,50 l 5,0 0,5 -5,0 z M 105,50 l 5,0 0,5 -5,0 z M 115,50 l 5,0 0,5 -5,0 z M 140,50 l 5,0 0,5 -5,0 z M 155,50 l 5,0 0,5 -5,0 z M 165,50 l 5,0 0,5 -5,0 z M 180,50 l 5,0 0,5 -5,0 z M 190,50 l 5,0 0,5 -5,0 z M 195,50 l 5,0 0,5 -5,0 z M 200,50 l 5,0 0,5 -5,0 z M 205,50 l 5,0 0,5 -5,0 z M 5,55 l 5,0 0,5 -5,0 z M 20,55 l 5,0 0,5 -5,0 z M 25,55 l 5,0 0,5 -5,0 z M 35,55 l 5,0 0,5 -5,0 z M 50,55 l 5,0 0,5 -5,0 z M 75,55 l 5,0 0,5 -5,0 z M 90,55 l 5,0 0,5 -5,0 z M 110,55 l 5,0 0,5 -5,0 z M 120,55 l 5,0 0,5 -5,0 z M 125,55 l 5,0 0,5 -5,0 z M 130,55 l 5,0 0,5 -5,0 z M 160,55 l 5,0 0,5 -5,0 z M 180,55 l 5,0 0,5 -5,0 z M 185,55 l 5,0 0,5 -5,0 z M 195,55 l 5,0 0,5 -5,0 z M 205,55 l 5,0 0,5 -5,0 z M 215,55 l 5,0 0,5 -5,0 z M 5,60 l 5,0 0,5 -5,0 z M 10,60 l 5,0 0,5 -5,0 z M 25,60 l 5,0 0,5 -5,0 z M 30,60 l 5,0 0,5 -5,0 z M 40,60 l 5,0 0,5 -5,0 z M 45,60 l 5,0 0,5 -5,0 z M 65,60 l 5,0 0,5 -5,0 z M 75,60 l 5,0 0,5 -5,0 z M 80,60 l 5,0 0,5 -5,0 z M 90,60 l 5,0 0,5 -5,0 z M 100,60 l 5,0 0,5 -5,0 z M 105,60 l 5,0 0,5 -5,0 z M 115,60 l 5,0 0,5 -5,0 z M 120,60 l 5,0 0,5 -5,0 z M 140,60 l 5,0 0,5 -5,0 z M 145,60 l 5,0 0,5 -5,0 z M 155,60 l 5,0 0,5 -5,0 z M 165,60 l 5,0 0,5 -5,0 z M 170,60 l 5,0 0,5 -5,0 z M 210,60 l 5,0 0,5 -5,0 z M 215,60 l 5,0 0,5 -5,0 z M 5,65 l 5,0 0,5 -5,0 z M 20,65 l 5,0 0,5 -5,0 z M 25,65 l 5,0 0,5 -5,0 z M 35,65 l 5,0 0,5 -5,0 z M 50,65 l 5,0 0,5 -5,0 z M 75,65 l 5,0 0,5 -5,0 z M 85,65 l 5,0 0,5 -5,0 z M 90,65 l 5,0 0,5 -5,0 z M 110,65 l 5,0 0,5 -5,0 z M 115,65 l 5,0 0,5 -5,0 z M 120,65 l 5,0 0,5 -5,0 z M 125,65 l 5,0 0,5 -5,0 z M 130,65 l 5,0 0,5 -5,0 z M 135,65 l 5,0 0,5 -5,0 z M 140,65 l 5,0 0,5 -5,0 z M 160,65 l 5,0 0,5 -5,0 z M 170,65 l 5,0 0,5 -5,0 z M 175,65 l 5,0 0,5 -5,0 z M 200,65 l 5,0 0,5 -5,0 z M 5,70 l 5,0 0,5 -5,0 z M 20,70 l 5,0 0,5 -5,0 z M 30,70 l 5,0 0,5 -5,0 z M 45,70 l 5,0 0,5 -5,0 z M 65,70 l 5,0 0,5 -5,0 z M 70,70 l 5,0 0,5 -5,0 z M 85,70 l 5,0 0,5 -5,0 z M 90,70 l 5,0 0,5 -5,0 z M 105,70 l 5,0 0,5 -5,0 z M 110,70 l 5,0 0,5 -5,0 z M 130,70 l 5,0 0,5 -5,0 z M 140,70 l 5,0 0,5 -5,0 z M 145,70 l 5,0 0,5 -5,0 z M 150,70 l 5,0 0,5 -5,0 z M 155,70 l 5,0 0,5 -5,0 z M 180,70 l 5,0 0,5 -5,0 z M 190,70 l 5,0 0,5 -5,0 z M 195,70 l 5,0 0,5 -5,0 z M 205,70 l 5,0 0,5 -5,0 z M 210,70 l 5,0 0,5 -5,0 z M 220,70 l 5,0 0,5 -5,0 z M 0,75 l 5,0 0,5 -5,0 z M 15,75 l 5,0 0,5 -5,0 z M 25,75 l 5,0 0,5 -5,0 z M 45,75 l 5,0 0,5 -5,0 z M 55,75 l 5,0 0,5 -5,0 z M 70,75 l 5,0 0,5 -5,0 z M 75,75 l 5,0 0,5 -5,0 z M 80,75 l 5,0 0,5 -5,0 z M 90,75 l 5,0 0,5 -5,0 z M 100,75 l 5,0 0,5 -5,0 z M 110,75 l 5,0 0,5 -5,0 z M 120,75 l 5,0 0,5 -5,0 z M 125,75 l 5,0 0,5 -5,0 z M 135,75 l 5,0 0,5 -5,0 z M 140,75 l 5,0 0,5 -5,0 z M 145,75 l 5,0 0,5 -5,0 z M 155,75 l 5,0 0,5 -5,0 z M 160,75 l 5,0 0,5 -5,0 z M 175,75 l 5,0 0,5 -5,0 z M 180,75 l 5,0 0,5 -5,0 z M 185,75 l 5,0 0,5 -5,0 z M 190,75 l 5,0 0,5 -5,0 z M 195,75 l 5,0 0,5 -5,0 z M 200,75 l 5,0 0,5 -5,0 z M 205,75 l 5,0 0,5 -5,0 z M 10,80 l 5,0 0,5 -5,0 z M 15,80 l 5,0 0,5 -5,0 z M 20,80 l 5,0 0,5 -5,0 z M 25,80 l 5,0 0,5 -5,0 z M 30,80 l 5,0 0,5 -5,0 z M 45,80 l 5,0 0,5 -5,0 z M 50,80 l 5,0 0,5 -5,0 z M 55,80 l 5,0 0,5 -5,0 z M 65,80 l 5,0 0,5 -5,0 z M 70,80 l 5,0 0,5 -5,0 z M 75,80 l 5,0 0,5 -5,0 z M 95,80 l 5,0 0,5 -5,0 z M 105,80 l 5,0 0,5 -5,0 z M 135,80 l 5,0 0,5 -5,0 z M 145,80 l 5,0 0,5 -5,0 z M 150,80 l 5,0 0,5 -5,0 z M 165,80 l 5,0 0,5 -5,0 z M 170,80 l 5,0 0,5 -5,0 z M 185,80 l 5,0 0,5 -5,0 z M 190,80 l 5,0 0,5 -5,0 z M 195,80 l 5,0 0,5 -5,0 z M 210,80 l 5,0 0,5 -5,0 z M 10,85 l 5,0 0,5 -5,0 z M 15,85 l 5,0 0,5 -5,0 z M 25,85 l 5,0 0,5 -5,0 z M 40,85 l 5,0 0,5 -5,0 z M 50,85 l 5,0 0,5 -5,0 z M 80,85 l 5,0 0,5 -5,0 z M 85,85 l 5,0 0,5 -5,0 z M 90,85 l 5,0 0,5 -5,0 z M 95,85 l 5,0 0,5 -5,0 z M 100,85 l 5,0 0,5 -5,0 z M 110,85 l 5,0 0,5 -5,0 z M 145,85 l 5,0 0,5 -5,0 z M 150,85 l 5,0 0,5 -5,0 z M 160,85 l 5,0 0,5 -5,0 z M 165,85 l 5,0 0,5 -5,0 z M 170,85 l 5,0 0,5 -5,0 z M 175,85 l 5,0 0,5 -5,0 z M 180,85 l 5,0 0,5 -5,0 z M 185,85 l 5,0 0,5 -5,0 z M 190,85 l 5,0 0,5 -5,0 z M 200,85 l 5,0 0,5 -5,0 z M 205,85 l 5,0 0,5 -5,0 z M 220,85 l 5,0 0,5 -5,0 z M 0,90 l 5,0 0,5 -5,0 z M 10,90 l 5,0 0,5 -5,0 z M 15,90 l 5,0 0,5 -5,0 z M 25,90 l 5,0 0,5 -5,0 z M 30,90 l 5,0 0,5 -5,0 z M 45,90 l 5,0 0,5 -5,0 z M 50,90 l 5,0 0,5 -5,0 z M 55,90 l 5,0 0,5 -5,0 z M 60,90 l 5,0 0,5 -5,0 z M 75,90 l 5,0 0,5 -5,0 z M 80,90 l 5,0 0,5 -5,0 z M 85,90 l 5,0 0,5 -5,0 z M 90,90 l 5,0 0,5 -5,0 z M 115,90 l 5,0 0,5 -5,0 z M 125,90 l 5,0 0,5 -5,0 z M 135,90 l 5,0 0,5 -5,0 z M 140,90 l 5,0 0,5 -5,0 z M 155,90 l 5,0 0,5 -5,0 z M 165,90 l 5,0 0,5 -5,0 z M 175,90 l 5,0 0,5 -5,0 z M 180,90 l 5,0 0,5 -5,0 z M 185,90 l 5,0 0,5 -5,0 z M 205,90 l 5,0 0,5 -5,0 z M 210,90 l 5,0 0,5 -5,0 z M 0,95 l 5,0 0,5 -5,0 z M 25,95 l 5,0 0,5 -5,0 z M 35,95 l 5,0 0,5 -5,0 z M 40,95 l 5,0 0,5 -5,0 z M 60,95 l 5,0 0,5 -5,0 z M 65,95 l 5,0 0,5 -5,0 z M 80,95 l 5,0 0,5 -5,0 z M 90,95 l 5,0 0,5 -5,0 z M 100,95 l 5,0 0,5 -5,0 z M 130,95 l 5,0 0,5 -5,0 z M 155,95 l 5,0 0,5 -5,0 z M 165,95 l 5,0 0,5 -5,0 z M 185,95 l 5,0 0,5 -5,0 z M 195,95 l 5,0 0,5 -5,0 z M 205,95 l 5,0 0,5 -5,0 z M 215,95 l 5,0 0,5 -5,0 z M 220,95 l 5,0 0,5 -5,0 z M 0,100 l 5,0 0,5 -5,0 z M 15,100 l 5,0 0,5 -5,0 z M 20,100 l 5,0 0,5 -5,0 z M 25,100 l 5,0 0,5 -5,0 z M 30,100 l 5,0 0,5 -5,0 z M 35,100 l 5,0 0,5 -5,0 z M 40,100 l 5,0 0,5 -5,0 z M 55,100 l 5,0 0,5 -5,0 z M 65,100 l 5,0 0,5 -5,0 z M 75,100 l 5,0 0,5 -5,0 z M 80,100 l 5,0 0,5 -5,0 z M 85,100 l 5,0 0,5 -5,0 z M 90,100 l 5,0 0,5 -5,0 z M 100,100 l 5,0 0,5 -5,0 z M 105,100 l 5,0 0,5 -5,0 z M 110,100 l 5,0 0,5 -5,0 z M 115,100 l 5,0 0,5 -5,0 z M 120,100 l 5,0 0,5 -5,0 z M 140,100 l 5,0 0,5 -5,0 z M 145,100 l 5,0 0,5 -5,0 z M 150,100 l 5,0 0,5 -5,0 z M 155,100 l 5,0 0,5 -5,0 z M 170,100 l 5,0 0,5 -5,0 z M 180,100 l 5,0 0,5 -5,0 z M 185,100 l 5,0 0,5 -5,0 z M 190,100 l 5,0 0,5 -5,0 z M 195,100 l 5,0 0,5 -5,0 z M 200,100 l 5,0 0,5 -5,0 z M 15,105 l 5,0 0,5 -5,0 z M 20,105 l 5,0 0,5 -5,0 z M 40,105 l 5,0 0,5 -5,0 z M 50,105 l 5,0 0,5 -5,0 z M 75,105 l 5,0 0,5 -5,0 z M 80,105 l 5,0 0,5 -5,0 z M 85,105 l 5,0 0,5 -5,0 z M 100,105 l 5,0 0,5 -5,0 z M 120,105 l 5,0 0,5 -5,0 z M 130,105 l 5,0 0,5 -5,0 z M 135,105 l 5,0 0,5 -5,0 z M 145,105 l 5,0 0,5 -5,0 z M 150,105 l 5,0 0,5 -5,0 z M 160,105 l 5,0 0,5 -5,0 z M 170,105 l 5,0 0,5 -5,0 z M 180,105 l 5,0 0,5 -5,0 z M 200,105 l 5,0 0,5 -5,0 z M 215,105 l 5,0 0,5 -5,0 z M 5,110 l 5,0 0,5 -5,0 z M 20,110 l 5,0 0,5 -5,0 z M 30,110 l 5,0 0,5 -5,0 z M 40,110 l 5,0 0,5 -5,0 z M 80,110 l 5,0 0,5 -5,0 z M 90,110 l 5,0 0,5 -5,0 z M 100,110 l 5,0 0,5 -5,0 z M 110,110 l 5,0 0,5 -5,0 z M 120,110 l 5,0 0,5 -5,0 z M 125,110 l 5,0 0,5 -5,0 z M 145,110 l 5,0 0,5 -5,0 z M 150,110 l 5,0 0,5 -5,0 z M 165,110 l 5,0 0,5 -5,0 z M 175,110 l 5,0 0,5 -5,0 z M 180,110 l 5,0 0,5 -5,0 z M 190,110 l 5,0 0,5 -5,0 z M 200,110 l 5,0 0,5 -5,0 z M 210,110 l 5,0 0,5 -5,0 z M 10,115 l 5,0 0,5 -5,0 z M 15,115 l 5,0 0,5 -5,0 z M 20,115 l 5,0 0,5 -5,0 z M 40,115 l 5,0 0,5 -5,0 z M 60,115 l 5,0 0,5 -5,0 z M 65,115 l 5,0 0,5 -5,0 z M 75,115 l 5,0 0,5 -5,0 z M 90,115 l 5,0 0,5 -5,0 z M 100,115 l 5,0 0,5 -5,0 z M 120,115 l 5,0 0,5 -5,0 z M 130,115 l 5,0 0,5 -5,0 z M 140,115 l 5,0 0,5 -5,0 z M 145,115 l 5,0 0,5 -5,0 z M 150,115 l 5,0 0,5 -5,0 z M 155,115 l 5,0 0,5 -5,0 z M 175,115 l 5,0 0,5 -5,0 z M 180,115 l 5,0 0,5 -5,0 z M 200,115 l 5,0 0,5 -5,0 z M 210,115 l 5,0 0,5 -5,0 z M 215,115 l 5,0 0,5 -5,0 z M 220,115 l 5,0 0,5 -5,0 z M 0,120 l 5,0 0,5 -5,0 z M 20,120 l 5,0 0,5 -5,0 z M 25,120 l 5,0 0,5 -5,0 z M 30,120 l 5,0 0,5 -5,0 z M 35,120 l 5,0 0,5 -5,0 z M 40,120 l 5,0 0,5 -5,0 z M 60,120 l 5,0 0,5 -5,0 z M 90,120 l 5,0 0,5 -5,0 z M 100,120 l 5,0 0,5 -5,0 z M 105,120 l 5,0 0,5 -5,0 z M 110,120 l 5,0 0,5 -5,0 z M 115,120 l 5,0 0,5 -5,0 z M 120,120 l 5,0 0,5 -5,0 z M 135,120 l 5,0 0,5 -5,0 z M 155,120 l 5,0 0,5 -5,0 z M 160,120 l 5,0 0,5 -5,0 z M 180,120 l 5,0 0,5 -5,0 z M 185,120 l 5,0 0,5 -5,0 z M 190,120 l 5,0 0,5 -5,0 z M 195,120 l 5,0 0,5 -5,0 z M 200,120 l 5,0 0,5 -5,0 z M 210,120 l 5,0 0,5 -5,0 z M 220,120 l 5,0 0,5 -5,0 z M 10,125 l 5,0 0,5 -5,0 z M 20,125 l 5,0 0,5 -5,0 z M 25,125 l 5,0 0,5 -5,0 z M 45,125 l 5,0 0,5 -5,0 z M 55,125 l 5,0 0,5 -5,0 z M 65,125 l 5,0 0,5 -5,0 z M 75,125 l 5,0 0,5 -5,0 z M 90,125 l 5,0 0,5 -5,0 z M 100,125 l 5,0 0,5 -5,0 z M 105,125 l 5,0 0,5 -5,0 z M 115,125 l 5,0 0,5 -5,0 z M 120,125 l 5,0 0,5 -5,0 z M 125,125 l 5,0 0,5 -5,0 z M 140,125 l 5,0 0,5 -5,0 z M 145,125 l 5,0 0,5 -5,0 z M 150,125 l 5,0 0,5 -5,0 z M 155,125 l 5,0 0,5 -5,0 z M 160,125 l 5,0 0,5 -5,0 z M 170,125 l 5,0 0,5 -5,0 z M 175,125 l 5,0 0,5 -5,0 z M 185,125 l 5,0 0,5 -5,0 z M 190,125 l 5,0 0,5 -5,0 z M 200,125 l 5,0 0,5 -5,0 z M 205,125 l 5,0 0,5 -5,0 z M 210,125 l 5,0 0,5 -5,0 z M 0,130 l 5,0 0,5 -5,0 z M 5,130 l 5,0 0,5 -5,0 z M 10,130 l 5,0 0,5 -5,0 z M 15,130 l 5,0 0,5 -5,0 z M 20,130 l 5,0 0,5 -5,0 z M 30,130 l 5,0 0,5 -5,0 z M 35,130 l 5,0 0,5 -5,0 z M 45,130 l 5,0 0,5 -5,0 z M 50,130 l 5,0 0,5 -5,0 z M 90,130 l 5,0 0,5 -5,0 z M 110,130 l 5,0 0,5 -5,0 z M 115,130 l 5,0 0,5 -5,0 z M 120,130 l 5,0 0,5 -5,0 z M 170,130 l 5,0 0,5 -5,0 z M 180,130 l 5,0 0,5 -5,0 z M 190,130 l 5,0 0,5 -5,0 z M 195,130 l 5,0 0,5 -5,0 z M 205,130 l 5,0 0,5 -5,0 z M 40,135 l 5,0 0,5 -5,0 z M 55,135 l 5,0 0,5 -5,0 z M 65,135 l 5,0 0,5 -5,0 z M 70,135 l 5,0 0,5 -5,0 z M 75,135 l 5,0 0,5 -5,0 z M 85,135 l 5,0 0,5 -5,0 z M 90,135 l 5,0 0,5 -5,0 z M 105,135 l 5,0 0,5 -5,0 z M 115,135 l 5,0 0,5 -5,0 z M 120,135 l 5,0 0,5 -5,0 z M 135,135 l 5,0 0,5 -5,0 z M 150,135 l 5,0 0,5 -5,0 z M 155,135 l 5,0 0,5 -5,0 z M 160,135 l 5,0 0,5 -5,0 z M 165,135 l 5,0 0,5 -5,0 z M 175,135 l 5,0 0,5 -5,0 z M 185,135 l 5,0 0,5 -5,0 z M 190,135 l 5,0 0,5 -5,0 z M 205,135 l 5,0 0,5 -5,0 z M 210,135 l 5,0 0,5 -5,0 z M 25,140 l 5,0 0,5 -5,0 z M 30,140 l 5,0 0,5 -5,0 z M 55,140 l 5,0 0,5 -5,0 z M 60,140 l 5,0 0,5 -5,0 z M 70,140 l 5,0 0,5 -5,0 z M 75,140 l 5,0 0,5 -5,0 z M 80,140 l 5,0 0,5 -5,0 z M 90,140 l 5,0 0,5 -5,0 z M 95,140 l 5,0 0,5 -5,0 z M 115,140 l 5,0 0,5 -5,0 z M 135,140 l 5,0 0,5 -5,0 z M 140,140 l 5,0 0,5 -5,0 z M 160,140 l 5,0 0,5 -5,0 z M 165,140 l 5,0 0,5 -5,0 z M 190,140 l 5,0 0,5 -5,0 z M 200,140 l 5,0 0,5 -5,0 z M 210,140 l 5,0 0,5 -5,0 z M 0,145 l 5,0 0,5 -5,0 z M 5,145 l 5,0 0,5 -5,0 z M 10,145 l 5,0 0,5 -5,0 z M 35,145 l 5,0 0,5 -5,0 z M 55,145 l 5,0 0,5 -5,0 z M 70,145 l 5,0 0,5 -5,0 z M 90,145 l 5,0 0,5 -5,0 z M 100,145 l 5,0 0,5 -5,0 z M 105,145 l 5,0 0,5 -5,0 z M 110,145 l 5,0 0,5 -5,0 z M 125,145 l 5,0 0,5 -5,0 z M 130,145 l 5,0 0,5 -5,0 z M 135,145 l 5,0 0,5 -5,0 z M 170,145 l 5,0 0,5 -5,0 z M 175,145 l 5,0 0,5 -5,0 z M 180,145 l 5,0 0,5 -5,0 z M 185,145 l 5,0 0,5 -5,0 z M 190,145 l 5,0 0,5 -5,0 z M 205,145 l 5,0 0,5 -5,0 z M 210,145 l 5,0 0,5 -5,0 z M 215,145 l 5,0 0,5 -5,0 z M 220,145 l 5,0 0,5 -5,0 z M 0,150 l 5,0 0,5 -5,0 z M 5,150 l 5,0 0,5 -5,0 z M 20,150 l 5,0 0,5 -5,0 z M 25,150 l 5,0 0,5 -5,0 z M 30,150 l 5,0 0,5 -5,0 z M 50,150 l 5,0 0,5 -5,0 z M 65,150 l 5,0 0,5 -5,0 z M 70,150 l 5,0 0,5 -5,0 z M 75,150 l 5,0 0,5 -5,0 z M 80,150 l 5,0 0,5 -5,0 z M 110,150 l 5,0 0,5 -5,0 z M 120,150 l 5,0 0,5 -5,0 z M 140,150 l 5,0 0,5 -5,0 z M 150,150 l 5,0 0,5 -5,0 z M 160,150 l 5,0 0,5 -5,0 z M 170,150 l 5,0 0,5 -5,0 z M 175,150 l 5,0 0,5 -5,0 z M 180,150 l 5,0 0,5 -5,0 z M 185,150 l 5,0 0,5 -5,0 z M 205,150 l 5,0 0,5 -5,0 z M 15,155 l 5,0 0,5 -5,0 z M 20,155 l 5,0 0,5 -5,0 z M 25,155 l 5,0 0,5 -5,0 z M 50,155 l 5,0 0,5 -5,0 z M 55,155 l 5,0 0,5 -5,0 z M 70,155 l 5,0 0,5 -5,0 z M 75,155 l 5,0 0,5 -5,0 z M 95,155 l 5,0 0,5 -5,0 z M 100,155 l 5,0 0,5 -5,0 z M 125,155 l 5,0 0,5 -5,0 z M 130,155 l 5,0 0,5 -5,0 z M 140,155 l 5,0 0,5 -5,0 z M 150,155 l 5,0 0,5 -5,0 z M 155,155 l 5,0 0,5 -5,0 z M 180,155 l 5,0 0,5 -5,0 z M 185,155 l 5,0 0,5 -5,0 z M 210,155 l 5,0 0,5 -5,0 z M 0,160 l 5,0 0,5 -5,0 z M 15,160 l 5,0 0,5 -5,0 z M 20,160 l 5,0 0,5 -5,0 z M 30,160 l 5,0 0,5 -5,0 z M 35,160 l 5,0 0,5 -5,0 z M 55,160 l 5,0 0,5 -5,0 z M 60,160 l 5,0 0,5 -5,0 z M 65,160 l 5,0 0,5 -5,0 z M 70,160 l 5,0 0,5 -5,0 z M 75,160 l 5,0 0,5 -5,0 z M 90,160 l 5,0 0,5 -5,0 z M 95,160 l 5,0 0,5 -5,0 z M 100,160 l 5,0 0,5 -5,0 z M 110,160 l 5,0 0,5 -5,0 z M 120,160 l 5,0 0,5 -5,0 z M 125,160 l 5,0 0,5 -5,0 z M 135,160 l 5,0 0,5 -5,0 z M 145,160 l 5,0 0,5 -5,0 z M 150,160 l 5,0 0,5 -5,0 z M 165,160 l 5,0 0,5 -5,0 z M 180,160 l 5,0 0,5 -5,0 z M 185,160 l 5,0 0,5 -5,0 z M 205,160 l 5,0 0,5 -5,0 z M 210,160 l 5,0 0,5 -5,0 z M 215,160 l 5,0 0,5 -5,0 z M 0,165 l 5,0 0,5 -5,0 z M 5,165 l 5,0 0,5 -5,0 z M 20,165 l 5,0 0,5 -5,0 z M 40,165 l 5,0 0,5 -5,0 z M 45,165 l 5,0 0,5 -5,0 z M 60,165 l 5,0 0,5 -5,0 z M 80,165 l 5,0 0,5 -5,0 z M 90,165 l 5,0 0,5 -5,0 z M 100,165 l 5,0 0,5 -5,0 z M 105,165 l 5,0 0,5 -5,0 z M 115,165 l 5,0 0,5 -5,0 z M 120,165 l 5,0 0,5 -5,0 z M 130,165 l 5,0 0,5 -5,0 z M 135,165 l 5,0 0,5 -5,0 z M 150,165 l 5,0 0,5 -5,0 z M 165,165 l 5,0 0,5 -5,0 z M 180,165 l 5,0 0,5 -5,0 z M 205,165 l 5,0 0,5 -5,0 z M 210,165 l 5,0 0,5 -5,0 z M 20,170 l 5,0 0,5 -5,0 z M 30,170 l 5,0 0,5 -5,0 z M 35,170 l 5,0 0,5 -5,0 z M 40,170 l 5,0 0,5 -5,0 z M 55,170 l 5,0 0,5 -5,0 z M 60,170 l 5,0 0,5 -5,0 z M 70,170 l 5,0 0,5 -5,0 z M 75,170 l 5,0 0,5 -5,0 z M 80,170 l 5,0 0,5 -5,0 z M 90,170 l 5,0 0,5 -5,0 z M 100,170 l 5,0 0,5 -5,0 z M 105,170 l 5,0 0,5 -5,0 z M 120,170 l 5,0 0,5 -5,0 z M 135,170 l 5,0 0,5 -5,0 z M 145,170 l 5,0 0,5 -5,0 z M 165,170 l 5,0 0,5 -5,0 z M 210,170 l 5,0 0,5 -5,0 z M 220,170 l 5,0 0,5 -5,0 z M 5,175 l 5,0 0,5 -5,0 z M 10,175 l 5,0 0,5 -5,0 z M 15,175 l 5,0 0,5 -5,0 z M 20,175 l 5,0 0,5 -5,0 z M 35,175 l 5,0 0,5 -5,0 z M 40,175 l 5,0 0,5 -5,0 z M 60,175 l 5,0 0,5 -5,0 z M 80,175 l 5,0 0,5 -5,0 z M 105,175 l 5,0 0,5 -5,0 z M 110,175 l 5,0 0,5 -5,0 z M 135,175 l 5,0 0,5 -5,0 z M 155,175 l 5,0 0,5 -5,0 z M 165,175 l 5,0 0,5 -5,0 z M 175,175 l 5,0 0,5 -5,0 z M 185,175 l 5,0 0,5 -5,0 z M 200,175 l 5,0 0,5 -5,0 z M 205,175 l 5,0 0,5 -5,0 z M 215,175 l 5,0 0,5 -5,0 z M 220,175 l 5,0 0,5 -5,0 z M 0,180 l 5,0 0,5 -5,0 z M 15,180 l 5,0 0,5 -5,0 z M 20,180 l 5,0 0,5 -5,0 z M 30,180 l 5,0 0,5 -5,0 z M 40,180 l 5,0 0,5 -5,0 z M 50,180 l 5,0 0,5 -5,0 z M 60,180 l 5,0 0,5 -5,0 z M 95,180 l 5,0 0,5 -5,0 z M 100,180 l 5,0 0,5 -5,0 z M 105,180 l 5,0 0,5 -5,0 z M 110,180 l 5,0 0,5 -5,0 z M 115,180 l 5,0 0,5 -5,0 z M 120,180 l 5,0 0,5 -5,0 z M 130,180 l 5,0 0,5 -5,0 z M 135,180 l 5,0 0,5 -5,0 z M 140,180 l 5,0 0,5 -5,0 z M 150,180 l 5,0 0,5 -5,0 z M 160,180 l 5,0 0,5 -5,0 z M 165,180 l 5,0 0,5 -5,0 z M 170,180 l 5,0 0,5 -5,0 z M 180,180 l 5,0 0,5 -5,0 z M 185,180 l 5,0 0,5 -5,0 z M 190,180 l 5,0 0,5 -5,0 z M 195,180 l 5,0 0,5 -5,0 z M 200,180 l 5,0 0,5 -5,0 z M 40,185 l 5,0 0,5 -5,0 z M 50,185 l 5,0 0,5 -5,0 z M 55,185 l 5,0 0,5 -5,0 z M 60,185 l 5,0 0,5 -5,0 z M 70,185 l 5,0 0,5 -5,0 z M 75,185 l 5,0 0,5 -5,0 z M 90,185 l 5,0 0,5 -5,0 z M 100,185 l 5,0 0,5 -5,0 z M 120,185 l 5,0 0,5 -5,0 z M 125,185 l 5,0 0,5 -5,0 z M 130,185 l 5,0 0,5 -5,0 z M 135,185 l 5,0 0,5 -5,0 z M 150,185 l 5,0 0,5 -5,0 z M 175,185 l 5,0 0,5 -5,0 z M 180,185 l 5,0 0,5 -5,0 z M 200,185 l 5,0 0,5 -5,0 z M 210,185 l 5,0 0,5 -5,0 z M 0,190 l 5,0 0,5 -5,0 z M 5,190 l 5,0 0,5 -5,0 z M 10,190 l 5,0 0,5 -5,0 z M 15,190 l 5,0 0,5 -5,0 z M 20,190 l 5,0 0,5 -5,0 z M 25,190 l 5,0 0,5 -5,0 z M 30,190 l 5,0 0,5 -5,0 z M 40,190 l 5,0 0,5 -5,0 z M 45,190 l 5,0 0,5 -5,0 z M 75,190 l 5,0 0,5 -5,0 z M 80,190 l 5,0 0,5 -5,0 z M 85,190 l 5,0 0,5 -5,0 z M 95,190 l 5,0 0,5 -5,0 z M 100,190 l 5,0 0,5 -5,0 z M 110,190 l 5,0 0,5 -5,0 z M 120,190 l 5,0 0,5 -5,0 z M 125,190 l 5,0 0,5 -5,0 z M 135,190 l 5,0 0,5 -5,0 z M 140,190 l 5,0 0,5 -5,0 z M 155,190 l 5,0 0,5 -5,0 z M 165,190 l 5,0 0,5 -5,0 z M 175,190 l 5,0 0,5 -5,0 z M 180,190 l 5,0 0,5 -5,0 z M 190,190 l 5,0 0,5 -5,0 z M 200,190 l 5,0 0,5 -5,0 z M 210,190 l 5,0 0,5 -5,0 z M 215,190 l 5,0 0,5 -5,0 z M 0,195 l 5,0 0,5 -5,0 z M 30,195 l 5,0 0,5 -5,0 z M 45,195 l 5,0 0,5 -5,0 z M 50,195 l 5,0 0,5 -5,0 z M 55,195 l 5,0 0,5 -5,0 z M 65,195 l 5,0 0,5 -5,0 z M 75,195 l 5,0 0,5 -5,0 z M 95,195 l 5,0 0,5 -5,0 z M 100,195 l 5,0 0,5 -5,0 z M 120,195 l 5,0 0,5 -5,0 z M 125,195 l 5,0 0,5 -5,0 z M 130,195 l 5,0 0,5 -5,0 z M 135,195 l 5,0 0,5 -5,0 z M 140,195 l 5,0 0,5 -5,0 z M 145,195 l 5,0 0,5 -5,0 z M 150,195 l 5,0 0,5 -5,0 z M 155,195 l 5,0 0,5 -5,0 z M 165,195 l 5,0 0,5 -5,0 z M 175,195 l 5,0 0,5 -5,0 z M 180,195 l 5,0 0,5 -5,0 z M 200,195 l 5,0 0,5 -5,0 z M 205,195 l 5,0 0,5 -5,0 z M 210,195 l 5,0 0,5 -5,0 z M 0,200 l 5,0 0,5 -5,0 z M 10,200 l 5,0 0,5 -5,0 z M 15,200 l 5,0 0,5 -5,0 z M 20,200 l 5,0 0,5 -5,0 z M 30,200 l 5,0 0,5 -5,0 z M 40,200 l 5,0 0,5 -5,0 z M 60,200 l 5,0 0,5 -5,0 z M 85,200 l 5,0 0,5 -5,0 z M 95,200 l 5,0 0,5 -5,0 z M 100,200 l 5,0 0,5 -5,0 z M 105,200 l 5,0 0,5 -5,0 z M 110,200 l 5,0 0,5 -5,0 z M 115,200 l 5,0 0,5 -5,0 z M 120,200 l 5,0 0,5 -5,0 z M 135,200 l 5,0 0,5 -5,0 z M 145,200 l 5,0 0,5 -5,0 z M 175,200 l 5,0 0,5 -5,0 z M 180,200 l 5,0 0,5 -5,0 z M 185,200 l 5,0 0,5 -5,0 z M 190,200 l 5,0 0,5 -5,0 z M 195,200 l 5,0 0,5 -5,0 z M 200,200 l 5,0 0,5 -5,0 z M 205,200 l 5,0 0,5 -5,0 z M 210,200 l 5,0 0,5 -5,0 z M 0,205 l 5,0 0,5 -5,0 z M 10,205 l 5,0 0,5 -5,0 z M 15,205 l 5,0 0,5 -5,0 z M 20,205 l 5,0 0,5 -5,0 z M 30,205 l 5,0 0,5 -5,0 z M 40,205 l 5,0 0,5 -5,0 z M 45,205 l 5,0 0,5 -5,0 z M 55,205 l 5,0 0,5 -5,0 z M 65,205 l 5,0 0,5 -5,0 z M 75,205 l 5,0 0,5 -5,0 z M 90,205 l 5,0 0,5 -5,0 z M 100,205 l 5,0 0,5 -5,0 z M 110,205 l 5,0 0,5 -5,0 z M 120,205 l 5,0 0,5 -5,0 z M 130,205 l 5,0 0,5 -5,0 z M 150,205 l 5,0 0,5 -5,0 z M 155,205 l 5,0 0,5 -5,0 z M 180,205 l 5,0 0,5 -5,0 z M 195,205 l 5,0 0,5 -5,0 z M 0,210 l 5,0 0,5 -5,0 z M 10,210 l 5,0 0,5 -5,0 z M 15,210 l 5,0 0,5 -5,0 z M 20,210 l 5,0 0,5 -5,0 z M 30,210 l 5,0 0,5 -5,0 z M 40,210 l 5,0 0,5 -5,0 z M 50,210 l 5,0 0,5 -5,0 z M 65,210 l 5,0 0,5 -5,0 z M 70,210 l 5,0 0,5 -5,0 z M 90,210 l 5,0 0,5 -5,0 z M 95,210 l 5,0 0,5 -5,0 z M 100,210 l 5,0 0,5 -5,0 z M 105,210 l 5,0 0,5 -5,0 z M 110,210 l 5,0 0,5 -5,0 z M 125,210 l 5,0 0,5 -5,0 z M 135,210 l 5,0 0,5 -5,0 z M 140,210 l 5,0 0,5 -5,0 z M 145,210 l 5,0 0,5 -5,0 z M 165,210 l 5,0 0,5 -5,0 z M 170,210 l 5,0 0,5 -5,0 z M 180,210 l 5,0 0,5 -5,0 z M 185,210 l 5,0 0,5 -5,0 z M 195,210 l 5,0 0,5 -5,0 z M 210,210 l 5,0 0,5 -5,0 z M 0,215 l 5,0 0,5 -5,0 z M 30,215 l 5,0 0,5 -5,0 z M 40,215 l 5,0 0,5 -5,0 z M 50,215 l 5,0 0,5 -5,0 z M 55,215 l 5,0 0,5 -5,0 z M 65,215 l 5,0 0,5 -5,0 z M 70,215 l 5,0 0,5 -5,0 z M 75,215 l 5,0 0,5 -5,0 z M 90,215 l 5,0 0,5 -5,0 z M 95,215 l 5,0 0,5 -5,0 z M 110,215 l 5,0 0,5 -5,0 z M 115,215 l 5,0 0,5 -5,0 z M 155,215 l 5,0 0,5 -5,0 z M 175,215 l 5,0 0,5 -5,0 z M 180,215 l 5,0 0,5 -5,0 z M 210,215 l 5,0 0,5 -5,0 z M 215,215 l 5,0 0,5 -5,0 z M 0,220 l 5,0 0,5 -5,0 z M 5,220 l 5,0 0,5 -5,0 z M 10,220 l 5,0 0,5 -5,0 z M 15,220 l 5,0 0,5 -5,0 z M 20,220 l 5,0 0,5 -5,0 z M 25,220 l 5,0 0,5 -5,0 z M 30,220 l 5,0 0,5 -5,0 z M 40,220 l 5,0 0,5 -5,0 z M 60,220 l 5,0 0,5 -5,0 z M 70,220 l 5,0 0,5 -5,0 z M 75,220 l 5,0 0,5 -5,0 z M 90,220 l 5,0 0,5 -5,0 z M 115,220 l 5,0 0,5 -5,0 z M 130,220 l 5,0 0,5 -5,0 z M 140,220 l 5,0 0,5 -5,0 z M 150,220 l 5,0 0,5 -5,0 z M 165,220 l 5,0 0,5 -5,0 z M 180,220 l 5,0 0,5 -5,0 z M 185,220 l 5,0 0,5 -5,0 z M 190,220 l 5,0 0,5 -5,0 z M 195,220 l 5,0 0,5 -5,0 z M 205,220 l 5,0 0,5 -5,0 z " />
      </g>
    </svg>
  );
}

function App() {
  const [devices, setDevices] = useState([]);
  const [activeDevice, setActiveDevice] = useState(null);
  const [color, setColor] = useState('#aa3bff');
  const [brightness, setBrightness] = useState(100);
  const [status, setStatus] = useState('starting');
  const [error, setError] = useState('');
  const [startWithWindows, setStartWithWindows] = useState(false);
  const [startHidden, setStartHidden] = useState(false);
  const [favoriteColors, setFavoriteColors] = useState([]);
  const [theme, setTheme] = useState('dark');
  const [effect, setEffect] = useState('static');
  const [effectSpeed, setEffectSpeed] = useState(50);
  const [effectDirection, setEffectDirection] = useState(0);
  const [effectSmoothness, setEffectSmoothness] = useState(50);
  const [version, setVersion] = useState('');
  const [showCoffeeModal, setShowCoffeeModal] = useState(false);

  // Profiles system states
  const [profiles, setProfiles] = useState([
    {
      id: 'default',
      name: 'Padrão',
      color: '#aa3bff',
      brightness: 100,
      effect: 'static',
      effectSpeed: 50,
      effectDirection: 0,
      effectSmoothness: 50
    }
  ]);
  const [activeProfileId, setActiveProfileId] = useState('default');

  useEffect(() => {
    const load = async () => {
      if (window.electronAPI?.getAppVersion) {
        try {
          const v = await window.electronAPI.getAppVersion();
          setVersion(v);
        } catch (e) {
          console.error(e);
        }
      }
      if (!window.electronAPI?.getSettings) return;
      const s = await window.electronAPI.getSettings();
      if (!s) return;
      
      if (Array.isArray(s.profiles)) {
        setProfiles(s.profiles);
      }
      if (s.activeProfileId) {
        setActiveProfileId(s.activeProfileId);
      }

      // Load active profile configs
      const active = s.profiles?.find(p => p.id === s.activeProfileId) || s.profiles?.[0] || s;
      if (active.color) setColor(active.color);
      if (active.brightness !== undefined) setBrightness(active.brightness);
      if (active.effect) setEffect(active.effect);
      if (active.effectSpeed !== undefined) setEffectSpeed(active.effectSpeed);
      if (active.effectDirection !== undefined) setEffectDirection(active.effectDirection);
      if (active.effectSmoothness !== undefined) setEffectSmoothness(active.effectSmoothness);

      if (s.startWithWindows !== undefined) setStartWithWindows(s.startWithWindows);
      if (s.startHidden !== undefined) setStartHidden(s.startHidden);
      if (Array.isArray(s.favoriteColors)) setFavoriteColors(s.favoriteColors);
      if (s.theme) setTheme(s.theme);

      // Load cached devices if present to prevent startup delay
      if (s.cachedDevices && Array.isArray(s.cachedDevices) && s.cachedDevices.length > 0) {
        setDevices(s.cachedDevices);
        const activeDev = s.cachedDevices.find(d => d.index === s.activeDeviceIndex) || s.cachedDevices[0];
        setActiveDevice(activeDev);
        setStatus('connected');
      }
    };
    load();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const save = useCallback(async (overrides = {}) => {
    if (!window.electronAPI?.saveSettings) return;

    let updatedProfiles = overrides.profiles !== undefined ? overrides.profiles : profiles;
    const currentActiveId = overrides.activeProfileId !== undefined ? overrides.activeProfileId : activeProfileId;

    // Update active profile values in profiles list
    updatedProfiles = updatedProfiles.map(p => {
      if (p.id === currentActiveId) {
        return {
          ...p,
          color: overrides.color !== undefined ? overrides.color : color,
          brightness: overrides.brightness !== undefined ? overrides.brightness : brightness,
          effect: overrides.effect !== undefined ? overrides.effect : effect,
          effectSpeed: overrides.effectSpeed !== undefined ? overrides.effectSpeed : effectSpeed,
          effectDirection: overrides.effectDirection !== undefined ? overrides.effectDirection : effectDirection,
          effectSmoothness: overrides.effectSmoothness !== undefined ? overrides.effectSmoothness : effectSmoothness,
        };
      }
      return p;
    });

    await window.electronAPI.saveSettings({
      startWithWindows: overrides.startWithWindows !== undefined ? overrides.startWithWindows : startWithWindows,
      startHidden: overrides.startHidden !== undefined ? overrides.startHidden : startHidden,
      favoriteColors: overrides.favoriteColors !== undefined ? overrides.favoriteColors : favoriteColors,
      theme: overrides.theme !== undefined ? overrides.theme : theme,
      profiles: updatedProfiles,
      activeProfileId: currentActiveId,
      // For backwards compatibility
      color: overrides.color !== undefined ? overrides.color : color,
      brightness: overrides.brightness !== undefined ? overrides.brightness : brightness,
      effect: overrides.effect !== undefined ? overrides.effect : effect,
      effectSpeed: overrides.effectSpeed !== undefined ? overrides.effectSpeed : effectSpeed,
      effectDirection: overrides.effectDirection !== undefined ? overrides.effectDirection : effectDirection,
      effectSmoothness: overrides.effectSmoothness !== undefined ? overrides.effectSmoothness : effectSmoothness,
    });
  }, [color, brightness, startWithWindows, startHidden, favoriteColors, theme, effect, effectSpeed, effectDirection, effectSmoothness, profiles, activeProfileId]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    save({ theme: next });
  };

  const handleToggle = async (field, val) => {
    if (field === 'startWithWindows') setStartWithWindows(val);
    if (field === 'startHidden') setStartHidden(val);
    await save({ [field]: val });
  };

  const toggleFavorite = async () => {
    const hex = color.toLowerCase();
    const updated = favoriteColors.includes(hex)
      ? favoriteColors.filter(c => c !== hex)
      : [...favoriteColors, hex];
    setFavoriteColors(updated);
    await save({ favoriteColors: updated });
  };

  const removeFav = async (hex) => {
    const updated = favoriteColors.filter(c => c !== hex);
    setFavoriteColors(updated);
    await save({ favoriteColors: updated });
  };

  const isFav = favoriteColors.includes(color.toLowerCase());

  const handleSelectDevice = async (device) => {
    setActiveDevice(device);
    if (window.electronAPI?.saveSettings) {
      await window.electronAPI.saveSettings({ activeDeviceIndex: device.index });
    }
  };

  // Device scanning
  const fetchDevices = useCallback(async () => {
    if (!window.electronAPI) { setStatus('error'); setError('Electron API não disponível'); return; }
    setStatus('scanning');
    setError('');
    const result = await window.electronAPI.getDevices();
    if (result?.error) { setStatus('error'); setError(result.error); }
    else if (Array.isArray(result)) {
      setDevices(result);
      if (result.length > 0) {
        setActiveDevice(prev => {
          if (prev) {
            const found = result.find(d => d.index === prev.index);
            if (found) return found;
          }
          return result[0];
        });
        setStatus('connected');
      }
      else { setStatus('error'); setError('Nenhum dispositivo RGB detectado.'); }
    }
  }, []);

  useEffect(() => {
    let cancelled = false, attempt = 0;
    const tryFetch = async () => {
      while (!cancelled && attempt < 10) {
        attempt++;
        if (window.electronAPI) {
          const r = await window.electronAPI.getDevices();
          if (cancelled) return;
          if (r?.error) { await new Promise(x => setTimeout(x, 2000)); continue; }
          if (Array.isArray(r) && r.length > 0) {
            setDevices(r);
            setActiveDevice(prev => {
              if (prev) {
                const found = r.find(d => d.index === prev.index);
                if (found) return found;
              }
              return r[0];
            });
            setStatus('connected');
            return;
          }
          if (Array.isArray(r) && r.length === 0) {
            if (devices.length === 0) {
              setStatus('error');
              setError('Nenhum dispositivo RGB detectado.');
            }
            return;
          }
        }
        await new Promise(x => setTimeout(x, 2000));
      }
      if (!cancelled && devices.length === 0) {
        setStatus('error');
        setError('Não foi possível conectar ao hardware.\nTente executar como Administrador.');
      }
    };

    if (devices.length > 0) {
      tryFetch();
    } else {
      const t = setTimeout(() => { setStatus('scanning'); tryFetch(); }, 3000);
      return () => { cancelled = true; clearTimeout(t); };
    }

    return () => { cancelled = true; };
  }, [devices.length]);

  const handleRetry = async () => {
    setStatus('scanning'); setError('');
    if (window.electronAPI?.retryConnection) await window.electronAPI.retryConnection();
    await fetchDevices();
  };

  // Apply effect
  const applyEffect = async () => {
    if (!activeDevice || !window.electronAPI) return;
    const opts = { effect, color, brightness, speed: effectSpeed, direction: effectDirection, smoothness: effectSmoothness };
    const result = await window.electronAPI.setEffect(activeDevice.index, activeDevice.colors.length, opts);
    if (result?.error) { alert('Erro: ' + result.error); return; }
    await save();
  };

  // Profiles operations
  const selectProfile = async (id) => {
    const p = profiles.find(prof => prof.id === id);
    if (!p) return;

    setActiveProfileId(id);
    setColor(p.color);
    setBrightness(p.brightness);
    setEffect(p.effect);
    setEffectSpeed(p.effectSpeed);
    setEffectDirection(p.effectDirection);
    setEffectSmoothness(p.effectSmoothness);

    // Auto apply
    if (activeDevice && window.electronAPI) {
      await window.electronAPI.setEffect(activeDevice.index, activeDevice.colors.length, {
        effect: p.effect, color: p.color, brightness: p.brightness, speed: p.effectSpeed, direction: p.effectDirection, smoothness: p.effectSmoothness
      });
    }

    await save({
      activeProfileId: id, color: p.color, brightness: p.brightness, effect: p.effect, effectSpeed: p.effectSpeed, effectDirection: p.effectDirection, effectSmoothness: p.effectSmoothness
    });
  };

  const createNewProfile = async () => {
    const name = prompt('Nome do novo perfil:');
    if (!name || !name.trim()) return;

    const newId = 'profile_' + Date.now();
    const newP = {
      id: newId,
      name: name.trim(),
      color, brightness, effect, effectSpeed, effectDirection, effectSmoothness
    };

    const updated = [...profiles, newP];
    setProfiles(updated);
    setActiveProfileId(newId);

    await save({ profiles: updated, activeProfileId: newId });

    if (activeDevice && window.electronAPI) {
      await window.electronAPI.setEffect(activeDevice.index, activeDevice.colors.length, {
        effect, color, brightness, speed: effectSpeed, direction: effectDirection, smoothness: effectSmoothness
      });
    }
  };

  const duplicateProfile = async (id) => {
    const target = profiles.find(p => p.id === id);
    if (!target) return;

    const newId = 'profile_' + Date.now();
    const copy = {
      ...target,
      id: newId,
      name: `${target.name} (Cópia)`
    };

    const updated = [...profiles, copy];
    setProfiles(updated);
    setActiveProfileId(newId);

    setColor(copy.color);
    setBrightness(copy.brightness);
    setEffect(copy.effect);
    setEffectSpeed(copy.effectSpeed);
    setEffectDirection(copy.effectDirection);
    setEffectSmoothness(copy.effectSmoothness);

    await save({
      profiles: updated, activeProfileId: newId, color: copy.color, brightness: copy.brightness, effect: copy.effect, effectSpeed: copy.effectSpeed, effectDirection: copy.effectDirection, effectSmoothness: copy.effectSmoothness
    });

    if (activeDevice && window.electronAPI) {
      await window.electronAPI.setEffect(activeDevice.index, activeDevice.colors.length, {
        effect: copy.effect, color: copy.color, brightness: copy.brightness, speed: copy.effectSpeed, direction: copy.effectDirection, smoothness: copy.effectSmoothness
      });
    }
  };

  const deleteProfile = async (id) => {
    if (profiles.length <= 1) return;

    const updated = profiles.filter(p => p.id !== id);
    setProfiles(updated);

    if (activeProfileId === id) {
      const first = updated[0];
      setActiveProfileId(first.id);
      setColor(first.color);
      setBrightness(first.brightness);
      setEffect(first.effect);
      setEffectSpeed(first.effectSpeed);
      setEffectDirection(first.effectDirection);
      setEffectSmoothness(first.effectSmoothness);

      await save({
        profiles: updated, activeProfileId: first.id, color: first.color, brightness: first.brightness, effect: first.effect, effectSpeed: first.effectSpeed, effectDirection: first.effectDirection, effectSmoothness: first.effectSmoothness
      });

      if (activeDevice && window.electronAPI) {
        await window.electronAPI.setEffect(activeDevice.index, activeDevice.colors.length, {
          effect: first.effect, color: first.color, brightness: first.brightness, speed: first.effectSpeed, direction: first.effectDirection, smoothness: first.effectSmoothness
        });
      }
    } else {
      await save({ profiles: updated });
    }
  };

  const handleExportProfile = async (profile) => {
    if (!window.electronAPI?.exportProfile) return;
    const res = await window.electronAPI.exportProfile(profile);
    if (res?.error) alert('Erro ao exportar: ' + res.error);
  };

  const handleImportProfile = async () => {
    if (!window.electronAPI?.importProfile) return;
    const res = await window.electronAPI.importProfile();
    if (res?.error) { alert(res.error); return; }
    if (res?.profile) {
      const newP = res.profile;
      const updated = [...profiles, newP];
      setProfiles(updated);
      setActiveProfileId(newP.id);

      setColor(newP.color);
      setBrightness(newP.brightness);
      setEffect(newP.effect);
      setEffectSpeed(newP.effectSpeed);
      setEffectDirection(newP.effectDirection);
      setEffectSmoothness(newP.effectSmoothness);

      await save({
        profiles: updated, activeProfileId: newP.id, color: newP.color, brightness: newP.brightness, effect: newP.effect, effectSpeed: newP.effectSpeed, effectDirection: newP.effectDirection, effectSmoothness: newP.effectSmoothness
      });

      if (activeDevice && window.electronAPI) {
        await window.electronAPI.setEffect(activeDevice.index, activeDevice.colors.length, {
          effect: newP.effect, color: newP.color, brightness: newP.brightness, speed: newP.effectSpeed, direction: newP.effectDirection, smoothness: newP.effectSmoothness
        });
      }
    }
  };

  const icon = (type) => {
    if (!type) return <FaQuestion />;
    const t = String(type).toLowerCase();
    if (t.includes('fan') || t.includes('cooler')) return <FaFan />;
    if (t.includes('motherboard') || t.includes('mainboard')) return <FaMicrochip />;
    if (t.includes('dram') || t.includes('memory')) return <FaMemory />;
    return <FaMicrochip />;
  };

  const statusContent = () => {
    if (status === 'starting' || status === 'scanning')
      return <div className="status-msg"><div className="spinner" /><p>{status === 'starting' ? 'Iniciando hardware...' : 'Procurando dispositivos...'}</p></div>;
    if (status === 'error')
      return <div className="status-msg error"><p style={{ whiteSpace: 'pre-line' }}>{error}</p><button className="btn-retry" onClick={handleRetry}><FaSync /> Tentar Novamente</button></div>;
    return null;
  };

  const rgb = hexToRgb(color);
  const isAnimated = ANIMATED_EFFECTS.includes(effect);
  const showColorPicker = effect !== 'off' && effect !== 'rainbow' && effect !== 'colorcycle';

  return (
    <>
      <div className="title-bar">KOSAK FAN RGB</div>
      <div className="app-layout">
        <div className="sidebar">
          {/* Devices List */}
          <div className="sidebar-label">Dispositivos</div>
          <div className="device-list">
            {status !== 'connected' && statusContent()}
            {devices.map(d => (
              <div key={d.index} className={`device-item ${activeDevice?.index === d.index ? 'active' : ''}`} onClick={() => handleSelectDevice(d)}>
                <div className="device-icon">{icon(d.type)}</div>
                <div className="device-info">
                  <h3>{d.name}</h3>
                  <p>{d.leds ? `${d.leds.length} LEDs` : 'RGB'}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Profiles System */}
          <div className="sidebar-label">Perfis</div>
          <div className="profile-list">
            {profiles.map(p => (
              <div key={p.id} className={`profile-item ${activeProfileId === p.id ? 'active' : ''}`} onClick={() => selectProfile(p.id)}>
                <span className="profile-name">{p.name}</span>
                <div className="profile-actions">
                  <button className="profile-action-btn" onClick={(e) => { e.stopPropagation(); duplicateProfile(p.id); }} title="Duplicar"><FaClone size={10} /></button>
                  <button className="profile-action-btn" onClick={(e) => { e.stopPropagation(); handleExportProfile(p); }} title="Exportar"><FaDownload size={10} /></button>
                  {profiles.length > 1 && (
                    <button className="profile-action-btn delete" onClick={(e) => { e.stopPropagation(); deleteProfile(p.id); }} title="Excluir"><FaTrash size={10} /></button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="profile-global-btns">
            <button className="btn-small-sidebar" onClick={createNewProfile}>+ Novo Perfil</button>
            <button className="btn-small-sidebar" onClick={handleImportProfile}><FaUpload size={9} /> Importar</button>
          </div>

          {/* Support Card in Sidebar */}
          <div className="sidebar-support" onClick={() => setShowCoffeeModal(true)}>
            <div className="sidebar-support-content">
              <FaCoffee className="sidebar-support-icon" />
              <div className="sidebar-support-info">
                <h3>Apoie o Projeto ☕</h3>
                <p>Clique para apoiar</p>
              </div>
            </div>
            <button className="btn-support-action-small">Apoiar</button>
          </div>

          <div className="sidebar-footer">
            <div className="toggle-row">
              <span className="toggle-label">Iniciar com Windows</span>
              <label className="toggle-switch">
                <input type="checkbox" checked={startWithWindows} onChange={e => handleToggle('startWithWindows', e.target.checked)} />
                <span className="toggle-track" />
              </label>
            </div>
            <div className="toggle-row">
              <span className="toggle-label">Iniciar oculto</span>
              <label className="toggle-switch">
                <input type="checkbox" checked={startHidden} onChange={e => handleToggle('startHidden', e.target.checked)} />
                <span className="toggle-track" />
              </label>
            </div>
            {status === 'connected' && (
              <button className="btn-small" onClick={handleRetry}><FaSync size={9} /> Atualizar</button>
            )}
            {version && (
              <div className="app-version">v{version}</div>
            )}
          </div>
        </div>

        <div className="main-panel">
          {activeDevice ? (
            <>
              <div className="main-scroll">
                {/* Effects */}
                <div className="section">
                  <div className="section-title">Efeito</div>
                  <div className="effects-grid">
                    {EFFECTS.map(fx => (
                      <button
                        key={fx.id}
                        className={`effect-btn ${effect === fx.id ? 'active' : ''}`}
                        onClick={() => setEffect(fx.id)}
                      >
                        {fx.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Picker - hidden for rainbow/colorcycle/off */}
                {showColorPicker && (
                  <div className="section">
                    <div className="section-title">Cor</div>
                    <div className="picker-row">
                      <HexColorPicker color={color} onChange={setColor} />
                      <div className="color-details">
                        <div className="color-swatch" style={{ backgroundColor: color }}>
                          <span className="color-hex">{color.toUpperCase()}</span>
                        </div>
                        <div className="rgb-row">
                          <div className="rgb-cell"><span className="rgb-cell-label r">R</span><span className="rgb-cell-val">{rgb.red}</span></div>
                          <div className="rgb-cell"><span className="rgb-cell-label g">G</span><span className="rgb-cell-val">{rgb.green}</span></div>
                          <div className="rgb-cell"><span className="rgb-cell-label b">B</span><span className="rgb-cell-val">{rgb.blue}</span></div>
                        </div>
                        <button className={`btn-fav ${isFav ? 'is-fav' : ''}`} onClick={toggleFavorite}>
                          {isFav ? <FaStar size={11} /> : <FaRegStar size={11} />}
                          {isFav ? 'Favoritada' : 'Favoritar'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Favorites */}
                {favoriteColors.length > 0 && showColorPicker && (
                  <div className="section">
                    <div className="section-title">Favoritas</div>
                    <div className="favorites-grid">
                      {favoriteColors.map(hex => (
                        <div key={hex} className={`fav-swatch ${color.toLowerCase() === hex ? 'active' : ''}`} style={{ backgroundColor: hex }} onClick={() => setColor(hex)}>
                          <span className="fav-remove" onClick={e => { e.stopPropagation(); removeFav(hex); }}>✕</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Effect Settings */}
                {effect !== 'off' && (
                  <div className="section">
                    <div className="section-title">Configurações</div>

                    {/* Brightness - always */}
                    <div className="config-row">
                      <span className="config-label">Brilho</span>
                      <div className="config-slider">
                        <input type="range" min="0" max="100" value={brightness} onChange={e => setBrightness(parseInt(e.target.value))} />
                        <span className="config-val">{brightness}%</span>
                      </div>
                    </div>

                    {/* Speed - animated only */}
                    {isAnimated && (
                      <div className="config-row">
                        <span className="config-label">Velocidade</span>
                        <div className="config-slider">
                          <input type="range" min="0" max="100" value={effectSpeed} onChange={e => setEffectSpeed(parseInt(e.target.value))} />
                          <span className="config-val">{effectSpeed}%</span>
                        </div>
                      </div>
                    )}

                    {/* Direction - animated only */}
                    {isAnimated && (
                      <div className="config-row">
                        <span className="config-label">Direção</span>
                        <div className="config-btns">
                          <button className={`dir-btn ${effectDirection === 0 ? 'active' : ''}`} onClick={() => setEffectDirection(0)}>→</button>
                          <button className={`dir-btn ${effectDirection === 1 ? 'active' : ''}`} onClick={() => setEffectDirection(1)}>←</button>
                        </div>
                      </div>
                    )}

                    {/* Smoothness - animated only */}
                    {isAnimated && (
                      <div className="config-row">
                        <span className="config-label">Suavidade</span>
                        <div className="config-slider">
                          <input type="range" min="0" max="100" value={effectSmoothness} onChange={e => setEffectSmoothness(parseInt(e.target.value))} />
                          <span className="config-val">{effectSmoothness}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="main-footer">
                <button className="btn-theme" onClick={toggleTheme}>
                  {theme === 'dark' ? <FaSun size={11} /> : <FaMoon size={11} />}
                  {theme === 'dark' ? 'Claro' : 'Escuro'}
                </button>
                <button className="btn-apply" onClick={applyEffect}>Aplicar</button>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <FaFan />
              <h2>Nenhum dispositivo selecionado</h2>
              <p>Selecione um dispositivo na lista lateral.</p>
            </div>
          )}
        </div>
      </div>

      {showCoffeeModal && (
        <div className="coffee-modal-overlay" onClick={() => setShowCoffeeModal(false)}>
          <div className="coffee-modal" onClick={(e) => e.stopPropagation()}>
            <button className="coffee-modal-close" onClick={() => setShowCoffeeModal(false)} title="Fechar">
              <FaTimes />
            </button>
            <div className="coffee-modal-title">Apoie o Desenvolvedor ☕</div>
            <div className="coffee-modal-subtitle">Se você gosta do software, considere apoiar para ajudar a manter o projeto ativo!</div>
            
            <div className="coffee-modal-columns">
              <div className="coffee-column">
                <h3>Doar via Pix (Brasil)</h3>
                <PixQRCode className="pix-qr-svg" />
                <p className="pix-text">Aponte a câmera do seu celular para o QR Code acima para doar via Pix.</p>
              </div>
              
              <div className="coffee-column">
                <h3>Buy Me a Coffee (Internacional)</h3>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <FaCoffee className="coffee-icon-large" />
                  <p className="pix-text">Contribua com um café pelo site oficial Buy Me A Coffee.</p>
                </div>
                <button 
                  className="coffee-btn-link"
                  onClick={() => window.electronAPI.openExternal('https://buymeacoffee.com/kosak')}
                >
                  Visitar buymeacoffee.com/kosak
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
