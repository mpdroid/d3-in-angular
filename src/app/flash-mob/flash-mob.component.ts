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
  driftInterval;

  audioContext;
  analyzer;
  dataArray;

  N = 5;
  means = [15,30,45,60,75];
  drifts = [0.1,-.1,0,.1,-.1 ];


  constructor(private chartControlsService: ChartControlsService) {
      this.chartControlsService.fullScreen = true;
   }

  ngOnInit() {  }

  initialize() {

    const audioContext = new AudioContext();
    const audioSrc = audioContext.createMediaElementSource(this.audio.nativeElement);
    this.analyzer = audioContext.createAnalyser();
    const bufferLength = this.analyzer.frequencyBinCount;
    this.dataArray = new Uint8Array(bufferLength);
    audioSrc.connect(this.analyzer);
    audioSrc.connect(audioContext.destination);
    this.analyzer.getByteFrequencyData(this.dataArray);


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
   this.drift();

  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    if (this.driftInterval) {
      clearInterval(this.driftInterval);
    }
  }

  ngAfterContentInit() {
    this.initialize();
  }

  drift() {
    this.driftInterval = setInterval(() => {
       for (let i = 0; i < this.N; i++) {
         this.drifts[i] = -this.drifts[i];
       }
    }, 160 * this.transitionTime);

  }
  generateData() {
    this.chartData = [];
    let mf = 1.0;
    if (this.analyzer) {

      this.analyzer.getByteFrequencyData(this.dataArray);
      mf = 200.0 / d3.mean(this.dataArray) ;
    }

    const sigma = mf * randomInt(2, 2) ;
    for( let i = 0; i < this.N;i++) {
      this.means[i] += this.drifts[i];
      const randomizer = d3.randomNormal(this.means[i], sigma);
      const times = [];
      for (let i = 0; i < 1000; i++) {
        times.push(Math.floor(randomizer()));
      }
      this.chartData.push(times);
    }



    // this.chartData.push(ptimes);
    // this.chartData.push(qtimes);
    // this.chartData.push(rtimes);
    // this.chartData.push(stimes);
    // this.chartData.push(ttimes);
  }

}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

