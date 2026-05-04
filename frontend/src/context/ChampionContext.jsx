/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useReducer, useCallback, useMemo } from "react";
import {
  getChampions,
  createChampion as apiCreateChampion,
  updateChampion as apiUpdateChampion,
  deleteChampion as apiDeleteChampion,
} from "../services/champions.service";

const ChampionContext = createContext();

const initialState = {
  champions: [],
  loading: false,
  error: null,
};

function championReducer(state, action) {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "SET_CHAMPIONS":
      return {
        ...state,
        champions: action.payload,
        loading: false,
        error: null,
      };
    case "ADD_CHAMPION":
      return {
        ...state,
        champions: [...state.champions, action.payload],
        loading: false,
      };
    case "EDIT_CHAMPION":
      return {
        ...state,
        champions: state.champions.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
        loading: false,
      };
    case "DELETE_CHAMPION":
      return {
        ...state,
        champions: state.champions.filter((c) => c.id !== action.payload),
        loading: false,
      };
    default:
      return state;
  }
}

export function ChampionProvider({ children }) {
  const [state, dispatch] = useReducer(championReducer, initialState);

  const fetchChampions = useCallback(async (search = "") => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const data = await getChampions(search);
      dispatch({ type: "SET_CHAMPIONS", payload: data });
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: err.message });
    }
  }, []);

  const addChampion = useCallback(async (championData) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const newChampion = await apiCreateChampion(championData);
      dispatch({ type: "ADD_CHAMPION", payload: newChampion });
      return newChampion;
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: err.message });
      throw err;
    }
  }, []);

  const editChampion = useCallback(async (id, championData) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const updatedChampion = await apiUpdateChampion(id, championData);
      dispatch({ type: "EDIT_CHAMPION", payload: updatedChampion });
      return updatedChampion;
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: err.message });
      throw err;
    }
  }, []);

  const deleteChampion = useCallback(async (id) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      await apiDeleteChampion(id);
      dispatch({ type: "DELETE_CHAMPION", payload: id });
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: err.message });
      throw err;
    }
  }, []);

  const contextValue = useMemo(() => ({
    ...state,
    fetchChampions,
    addChampion,
    editChampion,
    deleteChampion,
  }), [state, fetchChampions, addChampion, editChampion, deleteChampion]);

  return (
    <ChampionContext.Provider value={contextValue}>
      {children}
    </ChampionContext.Provider>
  );
}

export function useGlobalChampions() {
  const context = useContext(ChampionContext);
  if (!context) {
    throw new Error(
      "useGlobalChampions debe ser usado dentro de un ChampionProvider"
    );
  }
  return context;
}
