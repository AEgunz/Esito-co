import { Request, Response } from 'express';
import AmeexService from '../utils/AmeexService';

export const addParcel = async (req: Request, res: Response) => {
  try {
    const data = await AmeexService.createParcel(req.body);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const editParcel = async (req: Request, res: Response) => {
  try {
    const { parcelCode } = req.query;
    const data = await AmeexService.editParcel(parcelCode as string, req.body);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteParcel = async (req: Request, res: Response) => {
  try {
    const { parcelCode } = req.query;
    const data = await AmeexService.deleteParcel(parcelCode as string);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getParcelInfo = async (req: Request, res: Response) => {
  try {
    const { parcelCode } = req.query;
    const data = await AmeexService.getParcelInfo(parcelCode as string);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getParcelTracking = async (req: Request, res: Response) => {
  try {
    const { parcelCode } = req.query;
    const data = await AmeexService.getParcelTracking(parcelCode as string);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getParcelStatus = async (req: Request, res: Response) => {
  try {
    const data = await AmeexService.getParcelStatus();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const massTracking = async (req: Request, res: Response) => {
  try {
    const { codes } = req.body;
    const data = await AmeexService.massTracking(codes);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const massInfo = async (req: Request, res: Response) => {
  try {
    const { codes } = req.body;
    const data = await AmeexService.massInfo(codes);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const relaunchParcel = async (req: Request, res: Response) => {
  try {
    const { parcelCode } = req.query;
    const data = await AmeexService.relaunchParcel(parcelCode as string);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const relaunchNew = async (req: Request, res: Response) => {
  try {
    const { parcelCode } = req.query;
    const data = await AmeexService.relaunchNew(parcelCode as string, req.body);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getParcelsList = async (req: Request, res: Response) => {
  try {
    const data = await AmeexService.getParcelsList(req.body);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const addDeliveryNote = async (req: Request, res: Response) => {
  try {
    const data = await AmeexService.addDeliveryNote();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const addParcelsToNote = async (req: Request, res: Response) => {
  try {
    const { ref } = req.query;
    const { parcels } = req.body;
    const data = await AmeexService.addParcelsToNote(ref as string, parcels);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteDeliveryNote = async (req: Request, res: Response) => {
  try {
    const { ref } = req.query;
    const data = await AmeexService.deleteDeliveryNote(ref as string);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getPrintUrls = async (req: Request, res: Response) => {
  try {
    const { ref } = req.query;
    res.json({
      labels: AmeexService.getPrintLabelUrl(ref as string),
      note: AmeexService.getPrintNoteUrl(ref as string)
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const addPickupRequest = async (req: Request, res: Response) => {
  try {
    const data = await AmeexService.addPickupRequest(req.body);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
