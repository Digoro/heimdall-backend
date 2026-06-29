export enum ProductType {
    SLC = "SLC",
    GEC = "GEC",
    GEO = "GEO"
}

export interface Metadata {
    General: MetadataGeneral;
    SARParameter: MetadataSARParameter;
    Image: MetadataImage;
}

export interface MetadataGeneral {
    Mission_ID: string;
    Product_Type: string;
    Satellite_ID: string;
    Acquisition_Mode: string;
    Sample_Format: string;
    Product_Filename: string;
    Datetime: string;
    Scene_Sensing_Start_UTC: string;
    Scene_Sensing_Stop_UTC: string;
    Scene_Sensing_Center_UTC: string;
    Antenna_Length: number;
    Antenna_Beamwidth: number;
    Look_Side: string,
    Orbit_Direction: string;
    Referenced_UTC: string;
    Number_of_State_Vectors: number;
    State_Vectors_Times: number[];
    Attitude_Quaternions: number[];
    ECEF_Satellite_Position: Record<string, number[]>[];
    ECEF_Satellite_Velocity: Record<string, number[]>[];
    Roll_Angle: number[];
    Yaw_Angle: number[];
    Pitch_Angle: number[];
    Heading: number;
}

export interface MetadataSARParameter {
    Polarization: string;
    Center_Frequency: number;
    Echo_Sampling_Window_Length: number;
    PRF: number;
    Range_Chirp_Length: number;
    Range_Chirp_Rate: number;
    Rank: number;
    Sampling_Rate: number;
    Range_First_Time: number;
    Range_Samples: number;
    Azimuth_Lines: number;
    Incidence_Angle: number;
    Doppler_Bandwidth: number;
    Doppler_Polynomial: number[];
    Doppler_Polynomial_Dot: number[];
    Effective_Velocity: number;
    Range_Focusing_Bandwidth: number;
}

export interface MetadataImage {
    Range_Spacing: number;
    Line_Spacing: number;
    Range_Looks: number;
    Azimuth_Looks: number;
    Center_Lattitude: number;
    Center_Longitude: number;
    Near_Range_SLC: number;
    Center_Range_SLC: number;
    Far_Range_SLC: number;
    Far_Early_Geodetic_Coordinates: number[];
    Far_Incidence_Angle: number;
    Far_Late_Geodetic_Coordinates: number[];
    Far_Look_Angle: number;
    Near_Early_Geodetic_Coordinates: number[];
    Near_Incidence_Angle: number;
    Near_Late_Geodetic_Coordinates: number[];
    Near_Look_Angle: number;
    Center_Incidence_Angle: number;
}