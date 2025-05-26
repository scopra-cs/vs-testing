package org.example;
//File should contain Primitive Obsession and Overall Code Complexity smells^

public class TrackedPositiveFile {
    public String checkEligibility(int age, boolean hasLicense, boolean hasInsurance, boolean isHealthy, int drivingExperience) {
        if (age >= 18 && hasLicense && hasInsurance) {
            if (isHealthy) {
                if (drivingExperience >= 2) {
                    return "Eligible for driving.";
                } else {
                    return "Ineligible due to insufficient driving experience.";
                }
            } else {
                return "Ineligible due to health issues.";
            }
        }

        return "Ineligible due to health issues.";
    }

    private void testing2(int a, int b, int c, int d, int e){
        if(a > 5 && b < 6 && c < 4){

        }
    }

    private void testing3(int a, int b, int c, int d, int e){
        if(a > 5 && b < 6 && c < 4){

        }
    }

    private void testing4(int a, int b, int c, int d, int e){
        if(a > 5 && b < 6 && c < 4){

        }
    }

    private void testing5(int a, int b, int c, int d, int e){
        if(a > 5 && b < 6 && c < 4){

        }
    }

    private void testing6(int a, int b, int c, int d, int e){
        if(a > 5 && b < 6 && c < 4){

        }
    }

    private void testing7(int a, int b, int c, int d, int e){
        if(a > 5 && b < 6 && c < 4){

        }
    }
}