import { Component, OnInit, OnDestroy, AfterContentInit, ElementRef, isDevMode } from '@angular/core';
import { Router } from '@angular/router';
import { ViewChild } from '@angular/core';
import * as d3  from 'd3';

import { AreaChartComponent } from './../area-chart/area-chart.component';
import { ChartControlsService } from '../chart-controls.service';
import { DeliveryMetric } from '../order-delivery/order-delivery.component';
import { IWindow } from '../app.component';

@Component({
  selector: 'app-flash-mob',
  templateUrl: './flash-mob.component.html',
  styleUrls: ['./flash-mob.component.scss']
})
export class FlashMobComponent implements OnInit, OnDestroy, AfterContentInit {
  @ViewChild('areaChart', { static: true }) chart: AreaChartComponent;
  @ViewChild('audio', { static: true }) audio: ElementRef;

  chartData = [];

  transitionTime = 200;
  refreshInterval;

  audioContext;
  analyzer;
  dataArray;



  constructor(private chartControlsService: ChartControlsService) {
      this.chartControlsService.fullScreen = true;
   }

  ngOnInit() {

    // if(isDevMode()) {
    //     this.audio.nativeElement.source = 'assets/xlf.m4a';
    // }

  }

  initialize() {

    if ('AudioContext' in window) {
      const audioContext = new AudioContext();
      const audioSrc = audioContext.createMediaElementSource(this.audio.nativeElement);
      this.analyzer = audioContext.createAnalyser();

 
      const bufferLength = this.analyzer.frequencyBinCount;
      console.log('bufferlength', bufferLength);
      this.dataArray = new Uint8Array(bufferLength);
      this.analyzer.fftSize = 2048;
      audioSrc.connect(this.analyzer);
      audioSrc.connect(audioContext.destination);
      this.analyzer.getByteFrequencyData(this.dataArray);

   }


    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    this.generateData();
    this.chart.data = [...this.chartData];
    this.audio.nativeElement.play();
    this.refreshInterval = setInterval(() => {
      if(document.hasFocus()) {
        this.generateData();
        this.chart.data = [...this.chartData];  
      }
    }, this.transitionTime);

  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  ngAfterContentInit() {
    this.initialize();
  }

  generateData() {
    this.chartData = [];
    let maxDecibelRatio = 1;
    let mf = 1.0;
    if (this.analyzer) {

      this.analyzer.getByteFrequencyData(this.dataArray);
      // maxDecibelRatio = this.analyzer.maxDecibels / 100 ;
      // console.log(maxDecibelRatio);
      console.log('data array mean', 1.1 * d3.mean(this.dataArray));
      mf = 200.0 / d3.mean(this.dataArray) ;
      console.log(mf);

      //this.chartData.push(this.dataArray);
    }
    const meanPrepTime = randomInt(10, 11) + 0.0 ;
    const meanWaitTime = randomInt(8, 9) + 0.0;
    const meanTransitTime = randomInt(9, 10) + 0.0;

    const meanTotalTime = meanPrepTime + meanWaitTime + meanTransitTime;

    // const sigmaPrepTime = mf * randomInt(1, 1) ;
    const sigmaPrepTime = mf * randomInt(1, 2) ;
    console.log('sprep', mf);
    const sigmaWaitTime = randomInt(2, 3);
    const sigmaTransitTime = randomInt(1, 2);

    const sigmaTotalTime = Math.floor(
      Math.sqrt(Math.pow(sigmaPrepTime, 2) +
        Math.pow(sigmaWaitTime, 2) +
        Math.pow(sigmaTransitTime, 2))
    );


    let prandomizer = d3.randomNormal(8, sigmaPrepTime);
    let wrandomizer = d3.randomNormal(16, sigmaPrepTime);
    let trandomizer = d3.randomNormal(24, sigmaPrepTime);
    let qrandomizer = d3.randomNormal(32, sigmaPrepTime);
    let srandomizer = d3.randomNormal(40, sigmaPrepTime);

    const ptimes = [];
    const wtimes = [];
    const ttimes = [];
    const qtimes = [];
    const stimes = [];
    for (let i = 0; i < 1000; i++) {
      const p = Math.floor(prandomizer());
      const w = Math.floor(wrandomizer());
      const t = Math.floor(trandomizer());
      const q = Math.floor(qrandomizer());
      const s = srandomizer();
      ptimes.push(p);
      wtimes.push(w);
      ttimes.push(t);
      qtimes.push(q);
      stimes.push(s);
    }
    this.chartData.push(ptimes);
    this.chartData.push(wtimes);
    this.chartData.push(ttimes);
    this.chartData.push(qtimes);
    this.chartData.push(stimes);
    // this.chartData.push(totaltimes);
  }

}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

