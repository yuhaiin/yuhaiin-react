import { createContext, useContext } from 'react';

export interface AnimationContextType {
    direction: number;
}

const AnimationContext = createContext<AnimationContextType>({ direction: 0 });

export const useAnimation = () => useContext(AnimationContext);

export const AnimationProvider = AnimationContext.Provider;
