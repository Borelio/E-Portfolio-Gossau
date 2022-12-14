import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';
import { RaceService } from './race.service';
import { SpecialEffectsService } from './special-effects.service';

export enum EasterEgg {
    MotorSound = 'motor sound',
    Motor = 'motor',
    Fun = 'fun',
    Firework = 'firework',
    Rick = 'rick',
}

@Injectable({
    providedIn: 'root',
})
export class EasterEggService {
    private easterEggs: Array<EasterEgg> = [];
    private maxKeyDelay: number = 500;

    private correctTypedText: string = '';
    private lastKeyPress: DateTime = DateTime.local();
    jennyEffect: boolean = false;
    celloEffect: boolean = false;
    helpEffect: boolean = false;

    constructor(
        private raceService: RaceService,
        private specialEffectsService: SpecialEffectsService
    ) {
        this.easterEggs = Object.keys(EasterEgg) as Array<EasterEgg>;
    }

    getAllCommands() {
        return this.easterEggs.map(x => x.toLowerCase());;
    }

    keyPressed(key: string) {
        let possibleCommands = this.getAllCommands();

        if (key === 'Escape') {
            this.jennyEffect = false;
            this.celloEffect = false;

            this.correctTypedText = '';
            return;
        }

        let keyPressDelay = this.lastKeyPress.diffNow().milliseconds * -1;
        this.lastKeyPress = DateTime.local();
        if (keyPressDelay > this.maxKeyDelay) {
            this.correctTypedText = '';
        }

        this.correctTypedText += key.toLocaleLowerCase();

        if (!possibleCommands.some(x => x.startsWith(this.correctTypedText))) {
            this.correctTypedText = '';
            return;
        }

        if (!possibleCommands.some(x => x === this.correctTypedText)) {
            return;
        }

        switch (this.correctTypedText) {
            case EasterEgg.Motor:
            case EasterEgg.MotorSound:
                this.raceService.disableMotorSound = false;
                break;
            case EasterEgg.Rick:
                this.openUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
                break;
            case EasterEgg.Fun:
            case EasterEgg.Firework:
                this.specialEffectsService.manyFirework(5);
                break;
        }

        this.correctTypedText = '';
    }

    private openUrl(url: string) {
        window.open(url, '_blank')?.focus();
    }
}
