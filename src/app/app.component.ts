import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { ChartControlsService } from './chart-controls.service';

//https://stackoverflow.com/questions/38087013/angular2-web-speech-api-voice-recognition
export interface IWindow extends Window {
  webkitSpeechRecognition: any;
  webkitAudioContext: any;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Using d3 within Angular 8';
  speechRecogitionState = false;
  flashMob = false;

  constructor(
    private router: Router,
    private ngZone: NgZone,
    public chartControlsService: ChartControlsService) { }

  ngOnInit() {
  }

  toggleSpeechRecognition() {
    if ('webkitSpeechRecognition' in window) {
      const { webkitSpeechRecognition }: IWindow = <IWindow>(window as unknown);
      const recognition = new webkitSpeechRecognition();

      recognition.continuous = true;
      recognition.onresult = (event) => {
        const voiceCommand = event.results[event.results.length - 1][0].transcript;

        this.handleVoiceCommand(voiceCommand);
      }

      recognition.start();
    }
  }

  handleVoiceCommand(command) {
    const deliveryMatcher = new RegExp('.*delivery.*',"i");
    const statusMatcher = new RegExp('.*status.*',"i");
    const hideMatcher = new RegExp('.*hide.*data.*',"i");
    const showMatcher = new RegExp('.*show.*data.*',"i");
    const flashMatcher = new RegExp('.*flash.*',"i");
    if (deliveryMatcher.test(command.trim())) {
      this.navigate('/delivery');
      return;
    }
    if (statusMatcher.test(command.trim())) {
      this.navigate('/status');
      return;
    }
    if (showMatcher.test(command.trim())) {
      this.chartControlsService.showData = true;
      return;
    }
    if (hideMatcher.test(command.trim())) {
      this.chartControlsService.showData = false;
      return;
    }
    if (flashMatcher.test(command.trim())) {
      this.chartControlsService.fullScreen = true;
      this.navigate('/flashmob');
      return;
    }
  }

  navigate(path) {
    this.ngZone.run(() => {
      this.router.navigate([path]);
    });

  }

}
