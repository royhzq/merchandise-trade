#!/usr/bin/env python
# coding: utf-8

import pandas as pd
import numpy as np
import json

df_imp = pd.read_excel("outputFile.xlsx", sheet_name="T1", skiprows=5, thousands=",") #Merchandise import data
df_exp = pd.read_excel("outputFile.xlsx", sheet_name="T2", skiprows=5, thousands=",") #Merchandise export data

df_imp.tail()# Showing irrelevant rows

month_columns = df_imp.columns[1:]

df_imp = df_imp.iloc[:120]
df_exp = df_exp.iloc[:92]

# Replace 'na' strings to -90000
df_imp.replace("na", 0, inplace=True)
df_exp.replace("na", 0, inplace=True)
df_imp.replace("-", 0, inplace=True)
df_exp.replace("-", 0, inplace=True)

#Remove '(Thousand Dollars)' from country names
df_imp['Variables'] = df_imp['Variables'].apply(lambda x: x.replace('(Thousand Dollars)', ''))
df_exp['Variables'] = df_exp['Variables'].apply(lambda x: x.replace('(Thousand Dollars)', ''))

#Remove leading spaces from country names
df_imp['Variables'] = df_imp['Variables'].apply(lambda x: x.replace('        ', ''))
df_exp['Variables'] = df_exp['Variables'].apply(lambda x: x.replace('        ', ''))

#Drop first 7 rows - Not countries
df_imp = df_imp[7:]
df_exp = df_exp[7:]

#Convert columns to float values
df_imp[df_imp.columns[1:]] = df_imp[df_imp.columns[1:]].apply(pd.to_numeric, downcast="float", axis=1)
df_exp[df_exp.columns[1:]] = df_exp[df_exp.columns[1:]].apply(pd.to_numeric, downcast="float", axis=1)


def generate_quarter_col(df, last_quarter=4):
    '''
        Aggregates month columns and generates quarter columns
        (i.e., 1976q1, 2018q2, etc)
        last_quarter parameter takes in the ending quarter of series (1,2,3,4) 
    '''
    quarters = [
        ['Jan', 'Feb', 'Mar'],
        ['Apr', 'May', 'Jun'],
        ['Jul', 'Aug', 'Sep'],
        ['Oct', 'Nov', 'Dec']
    ]
    years = list(range(1976, 2019))
    
    for y in years:
        if y == years[-1]:
            quarters = quarters[:last_quarter]
        
        for i, q in enumerate(quarters, 1):
            col_name = str(y) + 'q' + str(i)

            df[col_name] = df[str(y) + ' ' + q[0]] + df[str(y) + ' ' + q[1]] + df[str(y) + ' ' + q[2]]
            #print(col_name, ' column ', 'created')

#Generate columns for quarter aggregates
generate_quarter_col(df_exp)
generate_quarter_col(df_imp)

# List of countries with imports but no exports
set(df_imp['Variables']) - set(df_exp['Variables'])

region_map = {
	"Belgium":"Europe",
	"Denmark":"Europe",
	"France":"Europe",
	"Germany, Federal Republic Of":"Europe",
	"Greece":"Europe",
	"Ireland":"Europe",
	"Italy":"Europe",
	"Luxembourg":"Europe",
	"Netherlands":"Europe",
	"United Kingdom":"Europe",
	"Portugal":"Europe",
	"Spain":"Europe",
	"Austria":"Europe",
	"Finland":"Europe",
	"Norway":"Europe",
	"Sweden":"Europe",
	"Switzerland":"Europe",
	"Liechtenstein":"Europe",
	"Malta":"Europe",
	"Germany, Democratic Republic Of":"Europe",
	"Hungary":"Europe",
	"Poland":"Europe",
	"Estonia":"Europe",
	"Latvia":"Europe",
	"Lithuania":"Europe",
	"Slovenia":"Europe",
	"Czech Republic":"Europe",
	"Slovak Republic (Slovakia)":"Europe",
	"Brunei Darussalam":"Asia",
	"Indonesia":"Asia",
	"Malaysia":"Asia",
	"Philippines":"Asia",
	"Thailand":"Asia",
	"Myanmar":"Asia",
	"Cambodia":"Asia",
	"Laos People's Democratic Republic":"Asia",
	"Vietnam, Socialist Republic Of":"Asia",
	"Japan":"Asia",
	"Hong Kong":"Asia",
	"Korea, Republic Of":"Asia",
	"Taiwan":"Asia",
	"Macau":"Asia",
	"China People's Republic":"Asia",
	"Korea, Democratic People's Republic Of":"Asia",
	"Afghanistan":"Asia",
	"Bangladesh":"Asia",
	"India":"Asia",
	"Maldives, Republic Of":"Asia",
	"Nepal":"Asia",
	"Pakistan":"Asia",
	"Sri Lanka":"Asia",
	"Bahrain":"Asia",
	"Cyprus":"Asia",
	"Iran (Islamic Republic Of)":"Asia",
	"Israel":"Asia",
	"Jordan":"Asia",
	"Kuwait":"Asia",
	"Lebanon":"Asia",
	"Oman":"Asia",
	"Qatar":"Asia",
	"Saudi Arabia":"Asia",
	"Syrian Arab Republic":"Asia",
	"United Arab Emirates":"Asia",
	"Yemen":"Asia",
	"Yemen Democratic":"Asia",
	"Canada":"Americas",
	"Puerto Rico":"Americas",
	"United States":"Americas",
	"Argentina":"Americas",
	"Brazil":"Americas",
	"Chile":"Americas",
	"Colombia":"Americas",
	"Ecuador":"Americas",
	"Mexico":"Americas",
	"Paraguay":"Americas",
	"Peru":"Americas",
	"Uruguay":"Americas",
	"Venezuela":"Americas",
	"Netherlands Antilles":"Americas",
	"Panama":"Americas",
	"Bahamas":"Americas",
	"Bermuda":"Americas",
	"French Guiana":"Americas",
	"Grenada":"Americas",
	"Guatemala":"Americas",
	"Honduras":"Americas",
	"Jamaica":"Americas",
	"St Vincent & The Grenadines":"Americas",
	"Trinidad & Tobago":"Americas",
	"Anguilla":"Americas",
	"Other Countries In America":"Americas",
	"Australia":"Oceania",
	"Fiji":"Oceania",
	"Nauru":"Oceania",
	"New Caledonia":"Oceania",
	"New Zealand":"Oceania",
	"Papua New Guinea":"Oceania",
	"Cocos (Keeling) Islands":"Oceania",
	"French Southern Territories":"Oceania",
	"Norfolk Island":"Oceania",
	"Cook Islands":"Oceania",
	"French Polynesia":"Oceania",
	"Guam":"Oceania",
	"Kiribati":"Oceania",
	"Niue":"Oceania",
	"Solomon Islands":"Oceania",
	"Tuvalu":"Oceania",
	"Wallis & Fatuna Islands":"Oceania",
	"Micronesia":"Oceania",
	"Palau":"Oceania",
	"South Sudan":"Oceania",
	"Other Countries In Oceania":"Oceania",
	"Commonwealth Of Independent States":"Other"
}


#Drop month columns and keep quarterly data
df_imp.drop(month_columns, axis=1, inplace=True)
df_exp.drop(month_columns, axis=1, inplace=True)

#Convert to dictionary to build json file
import_dict = df_imp.set_index(['Variables']).T.to_dict(orient='index')
export_dict = df_exp.set_index(['Variables']).T.to_dict(orient='index')

#Show max values for import and export

print("Max quarterly import value: {}".format(df_imp.values[:,1:].max()))
print("Max quarterly export value: {}".format(df_exp.values[:,1:].max()))

#Combine json files to have master json file:
# Format:
# [{ quarter:"1976q1", 'countries':[{'country':'', 'region':'', 'import':'', 'export': '', 'total': ''}}]}]

#Build the json file
json_data = []
quarters = sorted(import_dict.keys())
countries = df_imp['Variables']
for q in quarters:
    
    json_entry = {}
    json_entry['quarter'] = q
    countries_data = []
    
    for country in countries:
        imp = import_dict[q].get(country, 0)
        exp = export_dict[q].get(country, 0)
        total = imp + exp
        countries_data.append({
            'country':country,
            'region':region_map[country],
            'import':imp,
            'export':exp,
            'total':total
        })
        
    json_entry['countries'] = countries_data
    json_data.append(json_entry)


with open("merch_trade_data.json", "w") as f:
    f.write(json.dumps(json_data))


