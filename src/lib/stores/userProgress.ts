import { writable } from 'svelte/store';

const stored = localStorage.getItem('progress');
export const userProgress = writable(stored ? JSON.parse(stored) : {});

userProgress.subscribe((val) => {
  localStorage.setItem('progress', JSON.stringify(val));
});
