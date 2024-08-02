MidiIn min;
MidiMsg msg;
min.open(0);

Step s[8] => dac;

int chan;
for( int chan; chan < 8; chan++ )
{
    s[chan] => dac.chan(chan);
    
    0.0 => float phase;
    0.0 => float phaseAngle;
    second/samp => float sampleRate;
    
    1.0/128.0 => float maxAmp;
    maxAmp/128.0 => float minAmp;
    129.0/128.0 => float maxAmpChange;
    maxAmpChange * 129.0/128.0 => float minAmpChange;
    sampleRate/256.0 => float maxFreq;
    maxFreq/128.0 => float minFreq;
    129.0/128.0 => float maxFreqChange;
    maxFreqChange * 129.0/128.0 => float minFreqChange;
    128.0 => float maxCycle;
    1.0 => float minCycle;
    129.0/128.0 => float maxCycleChange;
    maxCycleChange * 129.0/128.0 => float minCycleChange;
    0.125 + (7.0/1024.0) => float maxPan;
    0.125 + (7.0/131072.0) => float minPan;
    129.0/128.0 => float maxPanChange;
    maxPanChange * 129.0/128.0 => float minPanChange;
    
    1.0 => float freqSmooth;
    1.0 => float ampSmooth;
    
    0.0 => float amp;
    amp => float nextAmp;
    (second/(samp * 2.0)) => float freq;
    freq => float nextFreq;

    Math.random2(0,1) => int ampDir;
    Math.random2(0,1) => int freqDir;
    Math.random2(0,1) => int cycleDir;
    Math.random2(0,1) => int panDir;
    
    float pan[8];
    0.125  => float c1;
    0.125 => float c2;
    0.125 => float c3;
    0.125 => float c4;
    0.125 => float c5;
    0.125 => float c6;
    0.125 => float c7;
    0.125 => float c8;
    
    1.0 => float cycle;
    1.0 => float vol;
    
    while( true ){
        
        if( ampDir == 0 ){
            amp / Math.random2f(minAmpChange, maxAmpChange) => amp;
        }
        if( ampDir == 1 ){
            amp * Math.random2f(minAmpChange, maxAmpChange) => amp;
        }
        if( amp <= minAmp ){
            minAmp => amp;
            1 => ampDir;
        }
        if( amp>= maxAmp ){
            maxAmp => amp;
            0 => ampDir;
        }
        if( freqDir == 0 ){
            freq / Math.random2f(minFreqChange, maxFreqChange) => freq;
        }
        if( freqDir == 1 ){
            freq * Math.random2f(minFreqChange, maxFreqChange) => freq;
        }
        if( freq <= minFreq ){
            minFreq => freq;
            1  => freqDir;
        }
        if( freq >= maxFreq ){
            maxFreq => freq;
            0 => freqDir; 
        }
        if( cycleDir == 0 ){
            cycle / Math.random2f(minCycleChange, maxCycleChange) => cycle;
        }
        if( cycleDir == 1 ){
            cycle * Math.random2f(minCycleChange, maxCycleChange) => cycle;
        }
        if( cycle <= minCycle ){
            minCycle => cycle;
            1 => cycleDir;
        }
        if( cycle >= maxCycle ){
            maxCycle => cycle;
            0 => cycleDir;
        }
        if( panDir == 0 ){
            c1 / Math.random2f(minPanChange, maxPanChange) => c1;
        }
        if( panDir == 1 ){
            c1 * Math.random2f(minPanChange, maxPanChange) => c1;
        }
        if( c1 <= minPan ){
            minPan => c1;
            1 => panDir;   
        }
        if( c1 >= maxPan ){
            maxPan => c1;
            0 => panDir;
        }
        
        Math.sqrt(maxFreq) - Math.sqrt(freq - minFreq) => float freqPreProb;
        freqPreProb/Math.sqrt(maxFreq) => float freqProb;
        Math.sqrt(maxAmp) - Math.sqrt((amp - minAmp)) => float ampPreProb;
        ampPreProb/Math.sqrt(maxAmp) => float ampProb;
        Math.sqrt(maxCycle) - Math.sqrt(cycle - minCycle) => float cyclePreProb;
        cyclePreProb/Math.sqrt(maxCycle) => float cycleProb;
        
        if( freqProb >= Math.randomf() ){
            1 => freqDir;
        }
        if( ampProb >= Math.randomf() ){
            1 => ampDir;
        }
        if( cycleProb >= Math.randomf() ){
            0 => cycleDir;
        }
        
        if( chan == 0 ){
        Math.random2f(((1 - c1)/7), Math.min(c1, (1 - c1))) => c2;
        Math.random2f(((1 - c1 - c2)/6), Math.min(c1, (1 - c1 - c2))) => c3;
        Math.random2f(((1 - c1 - c2 - c3)/5), Math.min(c1, (1 - c1 - c2 - c3))) => c4;
        Math.random2f(((1 - c1 - c2 - c3 - c4)/4), Math.min(c1, (1 - c1 - c2 - c3 - c4))) => c5;
        Math.random2f(((1 - c1 - c2 - c3 - c4 - c5)/3), Math.min(c1, (1 - c1 - c2 - c3 - c4 - c5))) => c6;
        Math.random2f(((1 - c1 - c2 - c3 - c4 - c5 - c6)/2), Math.min(c1, (1 - c1 - c2 - c3 - c4 - c5 - c6))) => c7;
        1 - c1 - c2 - c3 - c4 - c5 - c6 - c7 => c8;     
        [ c1, c2, c3, c4, c5, c6, c7, c8 ] @=> pan;
                
        for( 0 => int index; index < pan.size(); index++ ) {
            Math.random2(0,7) => int pos;
            pan[pos] => float save;
            pan[index] @=> pan[pos];
            save @=> pan[index];
        }
    }
    <<<pan[0], pan[1], pan[2], pan[3], pan[4], pan[5], pan[6], pan[7]>>>;
    
        0.5 * pan[chan] => s[chan].gain;
        
        Math.round(cycle) => cycle;
        
        Math.TWO_PI * cycle * sampleRate/freq => float sampleLoop;
        
        for( 0 => float count;
        count < sampleLoop;
        count + 1 => count )
        {
            Math.fabs( amp - nextAmp ) => float ampDif;
            Math.random2f(0,ampDif)/sampleLoop => float ampDither;
            Math.fabs( freq - nextFreq ) => float freqDif;
            Math.random2f(0,freqDif)/sampleLoop => float freqDither;
                        
            if( ampDir == 0 ){
                (amp/((minAmpChange + maxAmpChange)/2.0)) + ampDither => float nextAmp;
            }
            if( ampDir == 1 ){
                (amp*((minAmpChange + maxAmpChange)/2.0)) + ampDither => float nextAmp;
            }
            if( nextAmp < minAmp ){
                minAmp => nextAmp;
            }
            if( nextAmp > maxAmp ){
                maxAmp => nextAmp;
            }
            if( freqDir == 0 ){
                (freq/((minFreqChange + maxFreqChange)/2.0)) + freqDither => float nextFreq;
            }
            if( freqDir == 1 ){
                (freq*((minFreqChange + maxFreqChange)/2.0)) + freqDither => float nextFreq;
            }
            if( nextFreq < minFreq ){
                minFreq => nextFreq;
            }
            if( nextFreq > maxFreq ){
                maxFreq => nextFreq;
            }
            
            count/sampleLoop => float completion;
            (((completion * nextFreq) * freqSmooth) + freq)/(1.0 + (completion/cycle)) => float newFreq;
            (((completion * nextAmp) * ampSmooth) + amp)/(1.0 + (completion/cycle)) => float newAmp;            
            
            2.0 * newFreq / sampleRate => phaseAngle;
            Math.sin( phase ) * newAmp * vol => s[chan].next;
            phase + phaseAngle => phase;   
            1::samp => now;
            (chan+1)%8 => chan;
                       
            while( min.recv(msg) )
            {
                //<<< msg.data1, msg.data2, msg.data3 >>>;
                
                if( msg.data2 == 1 ){
                    msg.data3/127.0 => freqSmooth;
                }
                if( msg.data2 == 7 ){
                    msg.data3/127.0 => vol;
                }
                if( msg.data2 == 35 ){
                    (1.0 + msg.data3)/(maxAmp * 128.0) => minAmp;
                }
                if( msg.data2 == 41 ){
                    (1.0 + msg.data3)/128.0 => maxAmp;
                }
                if( msg.data2 == 44 ){
                    1.0 + (maxAmpChange * (1.0 + msg.data3)/128.0) => minAmpChange;
                }
                if( msg.data2 == 45 ){
                    1.0 + ((1.0 + msg.data3)/128.0) => maxAmpChange;
                }
                if( msg.data2 == 46 ){
                    0.125 + (7.0 * maxPan * (1.0 + msg.data3)/1024.0) => minPan;
                }
                if( msg.data2 == 47 ){
                    0.125 + (7.0 * (1.0 + msg.data3)/1024.0) => maxPan;
                }
                if( msg.data2 == 51 ){
                    1.0 + (maxPanChange * (1.0 + msg.data3)/128.0) => minPanChange;
                }
                if( msg.data2 == 53 ){
                    1.0 + ((1.0 + msg.data3)/128.0) => maxPanChange;
                }
                if( msg.data2 == 118 ){
                    msg.data3/127.0 => ampSmooth;
                }
                if( msg.data2 == 119 ){
                    msg.data3 + 1.0 => minCycle;
                }
                if( msg.data2 == 120 ){
                    (msg.data3 + 1.0) * minCycle => maxCycle;
                }
                if( msg.data2 == 121 ){
                    1.0 + (maxCycleChange * (msg.data3 + 1.0)/128.0) => minCycleChange;
                }
                if( msg.data2 == 122 ){
                    1.0 + ((1.0 + msg.data3)/128.0) => maxCycleChange;
                }
                if( msg.data2 == 123 ){
                    (1.0 + msg.data3)/(maxFreq * 128.0) => minFreq;
                }
                if( msg.data2 == 124 ){
                    sampleRate * (1.0 + msg.data3)/256.0 => maxFreq;
                }
                if( msg.data2 == 125 ){
                    1.0 + (maxFreqChange * (1.0 + msg.data3)/128.0) => minFreqChange;
                }
                if( msg.data2 == 126 ){
                    1.0 + ((1.0 + msg.data3)/128.0) => maxFreqChange;
                }
            }
        }
    }
}