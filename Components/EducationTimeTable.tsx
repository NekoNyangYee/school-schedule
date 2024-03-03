"use client";

import { ClassInfoResponse } from "@/interfaces/Interface";
import React, { useState, useEffect } from "react";

interface TimeTableData {
  PERIO: string;
  ITRT_CNTNT: string;
  ALL_TI_YMD: string;
  GRADE: string;
  CLASS_NM: string;
}

interface Selection {
  GRADE: string;
  CLASS_NM: string;
}

interface ClassInfo {
  GRADE: string;
  CLASS_NM: string;
}

const EducationTimeTable: React.FC = () => {
  const [timeTable, setTimeTable] = useState<Array<TimeTableData>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selection, setSelection] = useState<Selection>({ GRADE: "1", CLASS_NM: "1" }); // 기본 선택은 1학년 1반
  const [availableClasses, setAvailableClasses] = useState<Array<ClassInfo>>([]); // 사용 가능한 학급 정보 저장

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const OFFICE_CODE = process.env.NEXT_PUBLIC_OFFICE_CODE;
        const SCHOOL_CODE = process.env.NEXT_PUBLIC_SCHOOL_CODE;
        const API_KEY = process.env.NEXT_PUBLIC_MY_API_KEY;
        const currentYear = new Date().getFullYear().toString();

        const today: Date = new Date();
        const todayStr: string = `${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;

        const responseMisTimetable = await fetch(
          `/api/education?endpoint=misTimetable&KEY=${API_KEY}&ATPT_OFCDC_SC_CODE=${OFFICE_CODE}&SD_SCHUL_CODE=${SCHOOL_CODE}&ALL_TI_YMD=${todayStr}&GRADE=${selection.GRADE}&CLASS_NM=${selection.CLASS_NM}`
        );

        const responseClassInfo = await fetch(
          `/api/education?endpoint=classInfo&KEY=${API_KEY}&ATPT_OFCDC_SC_CODE=${OFFICE_CODE}&SD_SCHUL_CODE=${SCHOOL_CODE}&AY=${currentYear}`
        );

        if (!responseMisTimetable.ok || !responseClassInfo.ok) {
          throw new Error('Failed to fetch data');
        }

        const misTimetableData = await responseMisTimetable.json();
        const classInfoData = await responseClassInfo.json();

        // 시간표 데이터 필터링 및 상태 업데이트
        const filteredTimeTable = misTimetableData.misTimetable[1].row.filter((item: TimeTableData) => item.ALL_TI_YMD === todayStr && item.GRADE === selection.GRADE && item.CLASS_NM === selection.CLASS_NM);
        setTimeTable(filteredTimeTable);

        // 현재 년도에 해당하는 클래스 정보를 사용하여 선택 가능한 학년과 반 업데이트
        const classes = classInfoData.classInfo[1].row
          .filter((item: ClassInfoResponse) => item.AY === currentYear) // 현재 년도에 해당하는 데이터만 필터링
          .map((item: ClassInfoResponse) => ({ GRADE: item.GRADE.toString(), CLASS_NM: item.CLASS_NM.toString() }));
        setAvailableClasses(classes);

      } catch (error) {
        setError(error instanceof Error ? "시간표를 준비 중이에요. 잠시만 기다려주세요." : 'An unknown error occurred');
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selection]);

  const handleGradeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelection({ ...selection, GRADE: e.target.value });
  };

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelection({ ...selection, CLASS_NM: e.target.value });
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Today's Time Table for {timeTable[0].ALL_TI_YMD}</h1>
      {timeTable.length > 0 ? (
        <>
          <div>
            <label>Grade: </label>
            <select value={selection.GRADE} onChange={handleGradeChange}>
              {availableClasses
                .map((cls) => cls.GRADE)
                .filter((value, index, self) => self.indexOf(value) === index)
                .map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
            </select>
            <select value={selection.CLASS_NM} onChange={handleClassChange}>
              {availableClasses
                .filter((cls) => cls.GRADE === selection.GRADE)
                .map((cls, index) => ( // index를 사용하여 반 번호의 중복 문제를 해결
                  <option key={`${cls.GRADE}-${cls.CLASS_NM}-${index}`} value={cls.CLASS_NM}>
                    {cls.CLASS_NM}
                  </option>
                ))}
            </select>
          </div>
          <table>
            <thead>
              <tr>
                <th>교시</th>
                <th>시간표</th>
              </tr>
            </thead>
            <tbody>
              {timeTable.map((item, index) => (
                <tr key={index}>
                  <td>{item.PERIO}</td>
                  <td>{item.ITRT_CNTNT}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <p>No time table for today.</p>
      )}
    </div>
  );
};

export default EducationTimeTable;

